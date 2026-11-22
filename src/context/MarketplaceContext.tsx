import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Listing,
  RentalRequest,
  TradeOffer,
  PurchaseTransaction,
  Conversation,
  Message,
  CommunityRequest,
} from '../types';
import {
  INITIAL_LISTINGS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_TRADE_OFFERS,
  INITIAL_RENTAL_REQUESTS,
  INITIAL_PURCHASES,
  INITIAL_COMMUNITY_REQUESTS,
  DEMO_PROFILES,
} from '../services/mockData';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface MarketplaceContextType {
  listings: Listing[];
  savedIds: string[];
  rentalRequests: RentalRequest[];
  tradeOffers: TradeOffer[];
  purchases: PurchaseTransaction[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  communityRequests: CommunityRequest[];
  addCommunityRequest: (request: Omit<CommunityRequest, 'id' | 'created_at' | 'user' | 'user_id'>) => Promise<CommunityRequest>;
  confirmDealInChat: (conversationId: string, dealType: 'rental' | 'trade', notes?: string) => void;
  
  // Actions
  addListing: (listing: Omit<Listing, 'id' | 'user_id' | 'created_at' | 'view_count' | 'status'>) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  toggleSaveListing: (id: string) => void;
  isSaved: (id: string) => boolean;
  getListing: (id: string) => Listing | undefined;
  
  // Rental actions
  createRentalRequest: (request: Omit<RentalRequest, 'id' | 'renter_id' | 'status' | 'created_at'>) => Promise<RentalRequest>;
  updateRentalStatus: (id: string, status: RentalRequest['status']) => void;
  
  // Trade actions
  createTradeOffer: (offer: Omit<TradeOffer, 'id' | 'requester_id' | 'status' | 'created_at'>) => Promise<TradeOffer>;
  updateTradeStatus: (id: string, status: TradeOffer['status']) => void;
  
  // Purchase action
  processDemoPurchase: (params: { listingId: string; address: string }) => Promise<PurchaseTransaction>;
  
  // Messaging actions
  sendMessage: (conversationId: string, content: string, type?: Message['message_type'], metadata?: Record<string, any>) => void;
  startOrGetConversation: (listingId: string, targetUserId: string, subject?: string) => string;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const DATA_VERSION = 'v4';

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // If local storage has older version, reset to fresh initial mock data
  const isFreshVersion = typeof window !== 'undefined' && localStorage.getItem('narmis_version') === DATA_VERSION;
  if (typeof window !== 'undefined' && !isFreshVersion) {
    localStorage.setItem('narmis_version', DATA_VERSION);
    localStorage.removeItem('narmis_listings');
    localStorage.removeItem('narmis_conversations');
    localStorage.removeItem('narmis_messages');
    localStorage.removeItem('narmis_rental_requests');
    localStorage.removeItem('narmis_trade_offers');
    localStorage.removeItem('narmis_purchases');
    localStorage.removeItem('narmis_community_requests');
  }

  const [listings, setListings] = useState<Listing[]>(() => {
    const cached = localStorage.getItem('narmis_listings');
    return cached ? JSON.parse(cached) : INITIAL_LISTINGS;
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    const cached = localStorage.getItem('narmis_saved_ids');
    return cached ? JSON.parse(cached) : ['list-1', 'list-4'];
  });

  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>(() => {
    const cached = localStorage.getItem('narmis_rental_requests');
    return cached ? JSON.parse(cached) : INITIAL_RENTAL_REQUESTS;
  });

  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>(() => {
    const cached = localStorage.getItem('narmis_trade_offers');
    return cached ? JSON.parse(cached) : INITIAL_TRADE_OFFERS;
  });

  const [purchases, setPurchases] = useState<PurchaseTransaction[]>(() => {
    const cached = localStorage.getItem('narmis_purchases');
    return cached ? JSON.parse(cached) : INITIAL_PURCHASES;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const cached = localStorage.getItem('narmis_conversations');
    return cached ? JSON.parse(cached) : INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const cached = localStorage.getItem('narmis_messages');
    return cached ? JSON.parse(cached) : INITIAL_MESSAGES;
  });

  const [communityRequests, setCommunityRequests] = useState<CommunityRequest[]>(() => {
    const cached = localStorage.getItem('narmis_community_requests');
    return cached ? JSON.parse(cached) : INITIAL_COMMUNITY_REQUESTS;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-1');

  // Persistence to local storage for realistic state maintenance
  useEffect(() => {
    localStorage.setItem('narmis_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('narmis_community_requests', JSON.stringify(communityRequests));
  }, [communityRequests]);

  useEffect(() => {
    localStorage.setItem('narmis_saved_ids', JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    localStorage.setItem('narmis_rental_requests', JSON.stringify(rentalRequests));
  }, [rentalRequests]);

  useEffect(() => {
    localStorage.setItem('narmis_trade_offers', JSON.stringify(tradeOffers));
  }, [tradeOffers]);

  useEffect(() => {
    localStorage.setItem('narmis_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('narmis_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('narmis_messages', JSON.stringify(messages));
  }, [messages]);

  // Load from Supabase if active
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    const fetchSupabaseData = async () => {
      try {
        const { data: dbListings } = await client
          .from('listings')
          .select('*, profiles(*)')
          .eq('status', 'active');

        if (dbListings && dbListings.length > 0) {
          const mapped: Listing[] = dbListings.map((l: any) => ({
            id: l.id,
            user_id: l.user_id,
            user: {
              id: l.profiles?.id || l.user_id,
              full_name: l.profiles?.full_name || 'Verified Member',
              avatar_url: l.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              location: l.profiles?.location || l.location,
              rating: l.profiles?.rating || 5.0,
              review_count: l.profiles?.review_count || 1,
            },
            title: l.title,
            description: l.description,
            category: l.category,
            condition: l.condition,
            listing_type: l.listing_type,
            rental_price: l.rental_price,
            rental_duration: l.rental_duration,
            availability_status: l.availability_status || 'available',
            estimated_value: l.estimated_value,
            trade_desired: l.trade_desired,
            trade_cash_adjustment: l.trade_cash_adjustment,
            purchase_price: l.purchase_price,
            images: [l.image_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'],
            location: l.location || 'Bengaluru',
            status: l.status,
            featured: l.featured,
            view_count: l.view_count || 0,
            created_at: l.created_at,
          }));
          setListings(mapped);
        }
      } catch (err) {
        console.warn('Supabase fetch notice (using cache/mock store):', err);
      }
    };

    fetchSupabaseData();
  }, []);

  const getListing = (id: string): Listing | undefined => {
    return listings.find((l) => l.id === id);
  };

  const addListing = async (
    data: Omit<Listing, 'id' | 'user_id' | 'created_at' | 'view_count' | 'status'>
  ): Promise<Listing> => {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'list-' + Date.now();

    const newListing: Listing = {
      ...data,
      id: newId,
      user_id: user?.id || 'demo-user',
      user: user || undefined,
      status: 'active',
      view_count: 1,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('listings').insert([
          {
            id: newId,
            user_id: user.id,
            title: data.title,
            description: data.description,
            category: data.category,
            condition: data.condition,
            listing_type: data.listing_type,
            rental_price: data.rental_price,
            rental_duration: data.rental_duration,
            estimated_value: data.estimated_value,
            trade_desired: data.trade_desired,
            trade_cash_adjustment: data.trade_cash_adjustment,
            purchase_price: data.purchase_price,
            location: data.location,
            status: 'active',
          },
        ]);

        if (data.images && data.images.length > 0) {
          const imageRows = data.images.map((imgUrl, idx) => ({
            listing_id: newId,
            image_url: imgUrl,
            is_primary: idx === 0,
          }));
          await supabase.from('listing_images').insert(imageRows);
        }
      } catch (e) {
        console.error('Supabase insert listing error:', e);
      }
    }

    setListings((prev) => [newListing, ...prev]);
    return newListing;
  };

  const updateListing = (id: string, updates: Partial<Listing>) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleSaveListing = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isSaved = (id: string) => savedIds.includes(id);

  const createRentalRequest = async (
    reqData: Omit<RentalRequest, 'id' | 'renter_id' | 'status' | 'created_at'>
  ): Promise<RentalRequest> => {
    const newReq: RentalRequest = {
      ...reqData,
      id: 'rent-req-' + Date.now(),
      renter_id: user?.id || 'demo-user',
      renter: user || undefined,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setRentalRequests((prev) => [newReq, ...prev]);

    // Also auto-create a conversation message to owner
    const convId = startOrGetConversation(
      reqData.listing_id,
      reqData.owner_id,
      `Rental Request: ${reqData.listing?.title || 'Item Rental'}`
    );

    sendMessage(
      convId,
      `Requested Rental: ${reqData.duration_units} ${reqData.duration_type} (From ${reqData.start_date} to ${reqData.end_date}) for ₹${reqData.total_amount}. Note: ${reqData.message}`,
      'rental_offer',
      {
        startDate: reqData.start_date,
        endDate: reqData.end_date,
        totalAmount: reqData.total_amount,
        status: 'pending',
      }
    );

    return newReq;
  };

  const updateRentalStatus = (id: string, status: RentalRequest['status']) => {
    setRentalRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const createTradeOffer = async (
    offerData: Omit<TradeOffer, 'id' | 'requester_id' | 'status' | 'created_at'>
  ): Promise<TradeOffer> => {
    const newOffer: TradeOffer = {
      ...offerData,
      id: 'trade-offer-' + Date.now(),
      requester_id: user?.id || 'demo-user',
      requester: user || undefined,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setTradeOffers((prev) => [newOffer, ...prev]);

    // Auto-create negotiation conversation
    const convId = startOrGetConversation(
      offerData.listing_id,
      offerData.owner_id,
      `Trade Offer: ${offerData.offered_item_title}`
    );

    const adjustmentText =
      offerData.cash_adjustment > 0
        ? ` + ₹${offerData.cash_adjustment} cash`
        : offerData.cash_adjustment < 0
        ? ` (requesting ₹${Math.abs(offerData.cash_adjustment)} cash)`
        : ` (even trade)`;

    sendMessage(
      convId,
      `Trade Proposal: I am offering "${offerData.offered_item_title}" (est. ₹${offerData.offered_item_value})${adjustmentText}. ${offerData.negotiation_notes || ''}`,
      'trade_offer',
      {
        offeredItem: offerData.offered_item_title,
        estimatedValue: offerData.offered_item_value,
        cashAdjustment: offerData.cash_adjustment,
        status: 'pending',
      }
    );

    return newOffer;
  };

  const updateTradeStatus = (id: string, status: TradeOffer['status']) => {
    setTradeOffers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const processDemoPurchase = async ({
    listingId,
    address,
  }: {
    listingId: string;
    address: string;
  }): Promise<PurchaseTransaction> => {
    const targetListing = getListing(listingId);
    if (!targetListing) throw new Error('Listing not found');

    const receiptNumber = 'NRM-' + Math.floor(100000 + Math.random() * 900000);
    const newPurchase: PurchaseTransaction = {
      id: 'purch-' + Date.now(),
      listing_id: listingId,
      listing: targetListing,
      buyer_id: user?.id || 'demo-user',
      buyer: user || undefined,
      seller_id: targetListing.user_id,
      seller: targetListing.user,
      amount: targetListing.purchase_price || 0,
      status: 'completed',
      payment_method: 'DEMO PAYMENT (Hackathon Mode)',
      receipt_number: receiptNumber,
      shipping_address: address,
      created_at: new Date().toISOString(),
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    // Mark listing as completed or reserved
    updateListing(listingId, { status: 'completed' });

    // Send confirmation message to seller
    const convId = startOrGetConversation(
      listingId,
      targetListing.user_id,
      `Purchase Confirmation: ${targetListing.title}`
    );

    sendMessage(
      convId,
      `Demo Purchase Confirmed! Receipt: ${receiptNumber}. Deliver to: ${address}`,
      'system',
      { receiptNumber, amount: newPurchase.amount }
    );

    return newPurchase;
  };

  const sendMessage = (
    conversationId: string,
    content: string,
    type: Message['message_type'] = 'text',
    metadata?: Record<string, any>
  ) => {
    const newMsg: Message = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      conversation_id: conversationId,
      sender_id: user?.id || 'demo-user',
      sender: user || undefined,
      content,
      message_type: type,
      metadata,
      is_read: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              last_message_text: content,
              last_message_at: newMsg.created_at,
            }
          : c
      )
    );
  };

  const startOrGetConversation = (
    listingId: string,
    targetUserId: string,
    subject?: string
  ): string => {
    const existing = conversations.find(
      (c) =>
        (c.participant1_id === user?.id && c.participant2_id === targetUserId) ||
        (c.participant2_id === user?.id && c.participant1_id === targetUserId)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      return existing.id;
    }

    const partner =
      DEMO_PROFILES.find((p) => p.id === targetUserId) || {
        id: targetUserId,
        full_name: 'Marketplace Member',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      };

    const targetListing = getListing(listingId);
    const newConvId = 'conv-' + Date.now();
    const newConv: Conversation = {
      id: newConvId,
      listing_id: listingId,
      listing: targetListing,
      participant1_id: user?.id || 'demo-user',
      participant1: user || undefined,
      participant2_id: targetUserId,
      participant2: partner,
      subject: subject || (targetListing ? `Regarding ${targetListing.title}` : 'Inquiry'),
      last_message_text: 'Started conversation',
      last_message_at: new Date().toISOString(),
      unread_count: 0,
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConvId);
    return newConvId;
  };

  const addCommunityRequest = async (
    requestData: Omit<CommunityRequest, 'id' | 'created_at' | 'user' | 'user_id'>
  ): Promise<CommunityRequest> => {
    const newReq: CommunityRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      user_id: user?.id || 'guest-user',
      user: user || DEMO_PROFILES[0],
      created_at: new Date().toISOString(),
    };

    setCommunityRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const confirmDealInChat = (conversationId: string, dealType: 'rental' | 'trade', notes?: string) => {
    const confirmMsg: Message = {
      id: 'msg-' + Date.now(),
      conversation_id: conversationId,
      sender_id: user?.id || 'demo-user',
      sender: user || DEMO_PROFILES[0],
      content:
        dealType === 'rental'
          ? `🎉 [RENTAL CONFIRMED & APPROVED] ${user?.full_name || 'Owner'} has officially approved this rental reservation! ${notes ? `Notes: ${notes}` : 'Arranging meetup & handover.'}`
          : `🤝 [TRADE DEAL CONFIRMED] ${user?.full_name || 'Owner'} has accepted and finalized this trade exchange! ${notes ? `Notes: ${notes}` : 'Handover & cash offset confirmed.'}`,
      message_type: 'system',
      metadata: {
        action: 'deal_confirmed',
        dealType,
        confirmedAt: new Date().toISOString(),
        confirmedBy: user?.full_name,
      },
      is_read: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => {
      const convMsgs = prev[conversationId] || [];
      const updatedMsgs = convMsgs.map((m) => {
        if (m.metadata && (m.message_type === 'rental_offer' || m.message_type === 'trade_offer')) {
          return {
            ...m,
            metadata: {
              ...m.metadata,
              status: 'approved',
            },
          };
        }
        return m;
      });
      return {
        ...prev,
        [conversationId]: [...updatedMsgs, confirmMsg],
      };
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              last_message_text: `Deal confirmed by ${user?.full_name || 'seller'}`,
              last_message_at: new Date().toISOString(),
            }
          : c
      )
    );
  };

  return (
    <MarketplaceContext.Provider
      value={{
        listings,
        savedIds,
        rentalRequests,
        tradeOffers,
        purchases,
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        communityRequests,
        addCommunityRequest,
        confirmDealInChat,
        addListing,
        updateListing,
        deleteListing,
        toggleSaveListing,
        isSaved,
        getListing,
        createRentalRequest,
        updateRentalStatus,
        createTradeOffer,
        updateTradeStatus,
        processDemoPurchase,
        sendMessage,
        startOrGetConversation,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
