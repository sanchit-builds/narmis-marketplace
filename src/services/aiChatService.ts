import { Listing } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  links?: { label: string; path: string }[];
}

// Built-in Knowledge Base & Intent Matching for NARMIS
export async function getAiResponse(
  userQuery: string,
  history: ChatMessage[],
  currentListings: Listing[] = []
): Promise<{ text: string; suggestions?: string[]; links?: { label: string; path: string }[] }> {
  const query = userQuery.trim().toLowerCase();

  // Try live Gemini API if VITE_GEMINI_API_KEY is configured
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiApiKey && geminiApiKey !== 'your-gemini-api-key') {
    try {
      const liveResponse = await callGeminiApi(userQuery, history, currentListings, geminiApiKey);
      if (liveResponse) {
        return liveResponse;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to built-in NARMIS Sage AI Engine:', err);
    }
  }

  // Fallback to Built-in Contextual AI Engine (Instant, Resilient, Knowledge-rich)
  return generateContextualResponse(query, currentListings);
}

// Call Google Gemini REST API
async function callGeminiApi(
  userQuery: string,
  history: ChatMessage[],
  currentListings: Listing[],
  apiKey: string
): Promise<{ text: string; suggestions?: string[]; links?: { label: string; path: string }[] } | null> {
  const inventorySummary = currentListings.slice(0, 15).map(l => 
    `- ${l.title} (${l.listing_type.toUpperCase()}, Category: ${l.category}, Condition: ${l.condition}, Price/Value: ${
      l.listing_type === 'rent' ? `₹${l.rental_price}/${l.rental_duration}` :
      l.listing_type === 'trade' ? `Est. ₹${l.estimated_value} (Cash offset: ₹${l.trade_cash_adjustment})` :
      `₹${l.purchase_price}`
    }, Location: ${l.location}, Owner: ${l.user?.full_name || 'Community Member'})`
  ).join('\n');

  const systemInstruction = `You are "Sage", the official AI guide of NARMIS — a peer-to-peer circular economy marketplace with the tagline "Things have more than one life".
Your role is to clear doubts, explain how the platform works, and guide users through transactions warmly, concisely, and accurately.

Key NARMIS Knowledge:
1. RENT:
   - Durations: Hourly, Daily, Weekly.
   - Users browse items and click "Rent Now" to send a formal booking inquiry with duration and computed amount.
   - Deals can be approved and confirmed directly by owners inside the in-app chat.
2. TRADE & SUBSCRIPTION CRITERIA:
   - Item-for-item barter mechanism with dynamic valuation difference & cash adjustment offsets.
   - Free Trials: Every user gets 3 FREE trade trials.
   - Trader Elite Subscription: After 3 free trials are used, users subscribe (₹199/month or ₹1,499/year) to unlock unlimited trade proposals.
3. PLATFORM MARGIN POLICY (OUR MARGIN):
   - Items priced or valued at ₹1,000 or below: NARMIS platform margin is strictly 10% (e.g. on a ₹1,000 item, ₹100 is platform margin, seller net payout is ₹900).
   - Items above ₹1,000: Standard 5% platform margin applies.
   - Margin powers secure escrow, verified handover passcodes/QRs, and dispute coverage.
4. ONLINE SUPABASE CLOUD ARCHITECTURE:
   - User authentication (email/password) and profiles are stored securely in online Supabase.
   - All user-uploaded photos and camera captures upload directly to Supabase Storage (bucket: listing-images) so no media is stored on local user machines.
5. PURCHASE:
   - Buy pre-loved items with verified condition grades: Brand New, Like New, Excellent, Good, Fair.
   - Simulated checkout with instant order summary, receipt number (NRM-XXXX), and printable receipt with verification QR code.
6. LISTING WIZARD:
   - 3-step wizard at /create-listing: Step 1 (Details & Category), Step 2 (Type & conditional pricing/trade terms with live 10% margin preview), Step 3 (Photo upload & device camera capture directly to Supabase Storage).
7. CURRENT LIVE INVENTORY SNAPSHOT:
${inventorySummary}

Guidelines:
- Keep responses friendly, helpful, and concise (under 150 words when possible).
- Use bullet points for readability.
- Refer to Indian Rupee (₹) pricing.
- Mention relevant routes like /explore, /rent, /trade, /purchase, /create-listing when helpful.`;

  const conversationHistory = history.slice(-6).map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  conversationHistory.push({
    role: 'user',
    parts: [{ text: userQuery }]
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: conversationHistory,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  return {
    text,
    suggestions: [
      'How does trade cash offset work?',
      'How do I create a listing?',
      'Show me available rentals'
    ],
    links: [
      { label: 'Explore All Items', path: '/explore' },
      { label: 'Create Listing', path: '/create-listing' }
    ]
  };
}

// Built-in Knowledge Engine when API key is not present
function generateContextualResponse(
  query: string,
  listings: Listing[]
): { text: string; suggestions?: string[]; links?: { label: string; path: string }[] } {
  // GREETINGS & INTRODUCTIONS
  if (
    query.startsWith('hi') ||
    query.startsWith('hello') ||
    query.startsWith('hey') ||
    query === 'who are you' ||
    query.includes('what is narmis') ||
    query.includes('about narmis')
  ) {
    return {
      text: `👋 **Welcome to NARMIS!** I'm **Sage**, your AI guide.\n\nNARMIS is a peer-to-peer circular marketplace built on the philosophy: *"Things have more than one life."*\n\nInstead of letting valuable items gather dust or throw them away, you can:\n• 📅 **Rent** equipment by the hour, day, or week.\n• 🔄 **Trade** items directly with peer-to-peer barter + cash difference adjustments.\n• 🛍️ **Purchase** verified pre-loved products at fair prices.\n\nWhat would you like to explore today?`,
      suggestions: [
        'How does Trade work?',
        'How do I rent an item?',
        'How do I list my items?',
        'What items are available right now?'
      ],
      links: [
        { label: 'Explore Items', path: '/explore' },
        { label: 'About NARMIS', path: '/about' }
      ]
    };
  }

  // 1. TRADE & BARTER & CASH ADJUSTMENTS & SUBSCRIPTION CRITERIA
  if (
    query.includes('trial') ||
    query.includes('subscription') ||
    query.includes('trader elite') ||
    query.includes('how many trades') ||
    query.includes('free trade')
  ) {
    return {
      text: `🌟 **Trade Subscription & Free Trial Criteria:**\n\n• 🎁 **3 Free Trade Trials:** Every NARMIS member receives **3 free trade proposals** to experience item-for-item barter with zero fees.\n• 👑 **Trader Elite Subscription:** Once you have completed your 3 free trade proposals, an active subscription unlocks unlimited barters:\n  - **Monthly Pass:** ₹199 / month (cancel anytime)\n  - **Annual Pass:** ₹1,499 / year (save 37%)\n• 🛡️ **What's Included:** Unlimited barter offers, peer chat negotiations, valuation gap calculations, and escrow protection!`,
      suggestions: [
        'How does trade cash offset work?',
        'Go to Trading Section',
        'How does the 10% platform margin work?'
      ],
      links: [
        { label: 'Trading Section', path: '/trade' },
        { label: 'Create Trade Listing', path: '/create-listing?type=trade' }
      ]
    };
  }

  // 1B. PLATFORM MARGIN & 10% FEE POLICY
  if (
    query.includes('margin') ||
    query.includes('fee') ||
    query.includes('10%') ||
    query.includes('commission') ||
    query.includes('1000') ||
    query.includes('charges') ||
    query.includes('take') ||
    query.includes('payout')
  ) {
    return {
      text: `🛡️ **NARMIS Margin & Platform Fee Policy:**\n\nTransparency is our core standard:\n\n• 💰 **Items ₹1,000 or below:** Our platform margin is **10%**.\n  - *Example:* On an item priced at **₹1,000**, the NARMIS margin is **₹100**, and the seller's net payout is **₹900**.\n  - *Example:* On an item priced at **₹500**, the margin is **₹50**, and the seller payout is **₹450**.\n• 📦 **Items above ₹1,000:** Standard 5% platform margin applies.\n• 🔒 **Why the 10% Margin?** It funds 100% peer escrow security, verified in-person handover QR verification, safe fraud coverage, and zero-risk transactions!`,
      suggestions: [
        'How do purchases work?',
        'How does trade trial criteria work?',
        'Create a listing with margin preview'
      ],
      links: [
        { label: 'Create Listing', path: '/create-listing' },
        { label: 'Browse Items', path: '/explore' }
      ]
    };
  }

  // 1C. SUPABASE CLOUD UPLOADS & STORAGE
  if (
    query.includes('supabase') ||
    query.includes('cloud') ||
    query.includes('online') ||
    query.includes('storage') ||
    query.includes('database') ||
    query.includes('upload photo')
  ) {
    return {
      text: `☁️ **Supabase Online Cloud Architecture:**\n\n• 🔐 **Secure Auth:** Login and signup with your email and password connect directly to **Supabase Auth** online.\n• 📸 **Direct Cloud Photo Uploads:** Photos captured with your device camera or selected from your files are uploaded directly to the Supabase online storage bucket (\`listing-images\`). No files reside only on your local machine!\n• ⚡ **Live Synchronization:** All active listings, trade proposals, and messages are backed by Supabase PostgreSQL in real time.`,
      suggestions: [
        'How do I list an item?',
        'How does 10% margin work?',
        'Explore live catalog'
      ],
      links: [
        { label: 'List Equipment', path: '/create-listing' },
        { label: 'Explore Catalog', path: '/explore' }
      ]
    };
  }

  // 1D. GENERAL TRADE & BARTER & CASH ADJUSTMENTS
  if (
    query.includes('trade') ||
    query.includes('barter') ||
    query.includes('exchange') ||
    query.includes('cash adjustment') ||
    query.includes('offset') ||
    query.includes('value difference')
  ) {
    return {
      text: `🔄 **How Trade Works on NARMIS:**\n\nNARMIS features a smart **Item-for-Item Barter + Cash Difference** engine:\n\n1. **Value Matching:** Both parties enter the estimated value of their items.\n2. **Dynamic Cash Offset:** If there is a price gap, the requester can add or request a cash adjustment:\n   • *Example:* You offer a **Mouse (₹3,000)** for a **Mechanical Keyboard (₹3,500)**. You can add **+₹500 cash adjustment** to balance the deal.\n3. **3 Free Trials:** You get 3 free trade proposals! After 3 trades, you can activate the Trader Elite pass.\n4. **Mutual Approval:** Both parties review terms in the in-app chat and confirm the agreement.\n\nReady to see active trade listings?`,
      suggestions: [
        'How many free trade trials do I get?',
        'Show me items up for trade',
        'How does 10% margin work?'
      ],
      links: [
        { label: 'Go to Trade Marketplace', path: '/trade' },
        { label: 'Create Trade Listing', path: '/create-listing?type=trade' }
      ]
    };
  }

  // 2. RENT & DURATIONS & DEPOSITS
  if (
    query.includes('rent') ||
    query.includes('duration') ||
    query.includes('hourly') ||
    query.includes('daily') ||
    query.includes('weekly') ||
    query.includes('deposit') ||
    query.includes('borrow')
  ) {
    return {
      text: `📅 **How Rentals Work on NARMIS:**\n\nNeed high-end equipment for a project, match, or shoot without buying it outright?\n\n• **Flexible Durations:** Owners list items with **Hourly**, **Daily**, or **Weekly** rates.\n• **Booking Request:** Click *"Rent Now"* on any rental item to select your start date, duration units, and see total rental charges.\n• **In-Chat Approval:** The owner receives your request in in-app messages and can confirm the deal directly.\n• **Safety:** Coordinate meetups and inspect equipment before starting the rental term.`,
      suggestions: [
        'What cameras can I rent?',
        'How do owners confirm rentals?',
        'Show all rental listings'
      ],
      links: [
        { label: 'Browse Rentals', path: '/rent' },
        { label: 'List an Item for Rent', path: '/create-listing?type=rent' }
      ]
    };
  }

  // 3. PURCHASE & CONDITIONS & RECEIPTS
  if (
    query.includes('buy') ||
    query.includes('purchase') ||
    query.includes('checkout') ||
    query.includes('condition') ||
    query.includes('receipt') ||
    query.includes('price')
  ) {
    return {
      text: `🛍️ **How Purchasing Works on NARMIS:**\n\nBuy quality pre-loved goods directly from verified community peers:\n\n• **Condition Grading:** Every product is transparently graded:\n  - **Brand New:** Unopened, original packaging.\n  - **Like New:** Flawless condition, zero wear.\n  - **Excellent:** Minimal signs of use, fully inspected.\n  - **Good:** Normal cosmetic wear, 100% functional.\n  - **Fair:** Heavy cosmetic wear, fully working.\n• **Instant Demo Checkout:** Test our checkout flow, simulated payment, and receive a verified receipt with receipt number (\`NRM-XXXX\`) and QR code!`,
      suggestions: [
        'What is in the Purchase store?',
        'How do I get a receipt?',
        'Are items inspected?'
      ],
      links: [
        { label: 'Visit Purchase Store', path: '/purchase' },
        { label: 'Explore All Items', path: '/explore' }
      ]
    };
  }

  // 4. CREATING A LISTING / CAMERA / PHOTO UPLOAD
  if (
    query.includes('list') ||
    query.includes('create listing') ||
    query.includes('sell') ||
    query.includes('camera') ||
    query.includes('photo') ||
    query.includes('upload') ||
    query.includes('wizard')
  ) {
    return {
      text: `➕ **How to List an Item in 3 Easy Steps:**\n\n1. **Step 1 - Basic Info:** Enter item title, category (Electronics, Gaming, Cricket, Books, etc.), condition, and location.\n2. **Step 2 - Transaction Model:** Choose **Rent** (set hourly/daily rates), **Trade** (set estimated value & desired items), or **Purchase** (set cash price).\n3. **Step 3 - Photos & Camera:** Upload high-res photos or use our built-in **Device Camera Capture** to snap photos on the spot!`,
      suggestions: [
        'Start creating a listing now',
        'What categories are supported?',
        'Can I list for both rent and sale?'
      ],
      links: [
        { label: 'Open Listing Wizard', path: '/create-listing' }
      ]
    };
  }

  // 5. SAFETY, TRUST & COMMUNITY VERIFICATION
  if (
    query.includes('safe') ||
    query.includes('trust') ||
    query.includes('scam') ||
    query.includes('fraud') ||
    query.includes('verified') ||
    query.includes('review') ||
    query.includes('meet')
  ) {
    return {
      text: `🛡️ **Trust & Community Safety on NARMIS:**\n\n• **Community Profiles:** Check user ratings (e.g. 4.9★+), completed deals, and reviews from fellow peers.\n• **In-App Messaging:** Discuss terms, inspect details, and confirm agreements prior to handover.\n• **Safe Meetup Zones:** We recommend meeting in public spots around local hubs (e.g., Koramangala, Indiranagar, HSR Layout, Whitefield).\n• **Pre-Handover Inspection:** Always test electronics and check item condition together before marking a deal complete.`,
      suggestions: [
        'How does the in-app chat work?',
        'How do peer reviews work?',
        'View Community Board'
      ],
      links: [
        { label: 'View Messages', path: '/messages' },
        { label: 'Explore Community', path: '/explore' }
      ]
    };
  }

  // 6. INVENTORY SEARCH / SPECIFIC ITEM INQUIRIES
  const mentionsCamera = query.includes('camera') || query.includes('sony') || query.includes('photo');
  const mentionsKeyboard = query.includes('keyboard') || query.includes('keychron') || query.includes('hhkb');
  const mentionsLaptop = query.includes('laptop') || query.includes('macbook') || query.includes('pc') || query.includes('computer');
  const mentionsCricket = query.includes('cricket') || query.includes('bat') || query.includes('sports');
  const mentionsGaming = query.includes('game') || query.includes('gaming') || query.includes('ps5') || query.includes('playstation') || query.includes('switch');
  const mentionsBooks = query.includes('book') || query.includes('tolkien') || query.includes('manga');
  const mentionsTools = query.includes('tool') || query.includes('oscilloscope') || query.includes('soldering');

  if (mentionsCamera || mentionsKeyboard || mentionsLaptop || mentionsCricket || mentionsGaming || mentionsBooks || mentionsTools) {
    const matched = listings.filter(l => {
      const text = `${l.title} ${l.category} ${l.description}`.toLowerCase();
      if (mentionsCamera && (text.includes('camera') || text.includes('lens') || text.includes('sony'))) return true;
      if (mentionsKeyboard && text.includes('keyboard')) return true;
      if (mentionsLaptop && (text.includes('macbook') || text.includes('laptop'))) return true;
      if (mentionsCricket && (text.includes('cricket') || text.includes('bat'))) return true;
      if (mentionsGaming && (text.includes('ps5') || text.includes('playstation') || text.includes('switch') || text.includes('gaming'))) return true;
      if (mentionsBooks && (text.includes('book') || text.includes('tolkien') || text.includes('hardcover'))) return true;
      if (mentionsTools && (text.includes('oscilloscope') || text.includes('tool') || text.includes('soldering'))) return true;
      return false;
    });

    if (matched.length > 0) {
      const top3 = matched.slice(0, 3);
      const itemsList = top3.map(item => {
        const pricing = item.listing_type === 'rent'
          ? `₹${item.rental_price}/${item.rental_duration}`
          : item.listing_type === 'trade'
          ? `Est. ₹${item.estimated_value} (Trade)`
          : `₹${item.purchase_price} (Buy)`;
        return `• **[${item.title}](/product/${item.id})** — ${item.listing_type.toUpperCase()} • ${pricing} • Location: ${item.location}`;
      }).join('\n');

      return {
        text: `🔍 **Found matching items in our active catalog:**\n\n${itemsList}\n\nClick on any item to view photos, condition grading, and owner details!`,
        suggestions: [
          'Show all items in this category',
          'How do I contact the seller?',
          'Can I make a counter-offer?'
        ],
        links: [
          { label: 'Explore All Listings', path: '/explore' }
        ]
      };
    }
  }

  // 7. DEMO PERSONAS & HACKATHON EVALUATION
  if (
    query.includes('vipan') ||
    query.includes('sanchit') ||
    query.includes('shraddha') ||
    query.includes('harshit') ||
    query.includes('persona') ||
    query.includes('demo') ||
    query.includes('hackathon')
  ) {
    return {
      text: `🎭 **Interactive Demo Personas:**\n\nTo make evaluating peer-to-peer flows seamless without logging in and out, NARMIS includes a **Demo Persona Switcher** on the bottom-left of your screen!\n\n• **Vipan:** Hardware engineer (Oscilloscopes & Electronics)\n• **Shraddha:** Filmmaker (Sony Cinema Camera, Studio Mics)\n• **Sanchit:** Gamer & Athlete (PS5, Volleyball, Keychron K2)\n• **Harshit:** Tech developer (MacBook M2, Cricket Gear)\n• **Shabadh:** Bibliophile (Tolkien Collector Hardcovers)\n\nSwitch personas anytime to view, accept, or reject deals from both sides!`,
      suggestions: [
        'How does chat deal confirmation work?',
        'How do I test a trade between two users?',
        'Tell me more about NARMIS'
      ]
    };
  }

  // 8. GENERAL INVENTORY OVERVIEW
  if (query.includes('item') || query.includes('available') || query.includes('products') || query.includes('catalog')) {
    const totalCount = listings.length;
    const rentCount = listings.filter(l => l.listing_type === 'rent').length;
    const tradeCount = listings.filter(l => l.listing_type === 'trade').length;
    const buyCount = listings.filter(l => l.listing_type === 'purchase').length;

    return {
      text: `📦 **NARMIS Marketplace Snapshot:**\n\nWe currently have **${totalCount} active items** across Bengaluru:\n• 📅 **${rentCount} Rentals** (Cameras, Audio, Laptops, Oscilloscopes)\n• 🔄 **${tradeCount} Trade Offers** (Mechanical Keyboards, Consoles, Rare Books)\n• 🛍️ **${buyCount} Direct Purchases** (Sports gear, Cricket bats, Tech)\n\nYou can filter by 10 distinct categories, condition, or location on the Explore page!`,
      suggestions: [
        'Show me rental gear',
        'Show me trade listings',
        'Show me items for sale'
      ],
      links: [
        { label: 'Explore All Listings', path: '/explore' }
      ]
    };
  }

  // DEFAULT HELPFUL FALLBACK
  return {
    text: `💡 **I'm here to help with anything on NARMIS!**\n\nYou can ask me about:\n• 📅 **Rentals:** Rates, booking durations & reservation inquiries.\n• 🔄 **Trades:** Barter mechanics, value matching & cash offsets.\n• 🛍️ **Purchases:** Condition ratings, demo checkout & receipts.\n• ➕ **Listing:** How to list equipment with photo/camera upload.\n• 🔍 **Search:** Inquire about specific cameras, electronics, sports gear, or books!`,
    suggestions: [
      'How does Trade with cash offset work?',
      'How do I rent equipment?',
      'How do I list my items?',
      'What are the item condition grades?'
    ],
    links: [
      { label: 'Explore Listings', path: '/explore' },
      { label: 'Create a Listing', path: '/create-listing' }
    ]
  };
}
