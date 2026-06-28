export interface Track {
  title: string;
  artist: string;
  src: string;
  artwork: string;
}

export const PLAYLISTS: Record<string, Track[]> = {
  lockin: [
    { title: "Run Boy Run", artist: "Woodkid", src: "/audio/lockin_0.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Legends Never Die", artist: "Against The Current", src: "/audio/lockin_1.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Warriors", artist: "Imagine Dragons", src: "/audio/lockin_2.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Hall of Fame", artist: "The Script", src: "/audio/lockin_3.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Believer", artist: "Imagine Dragons", src: "/audio/lockin_4.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Centuries", artist: "Fall Out Boy", src: "/audio/lockin_5.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/ea/5f/87/ea5f87ea-4bc3-0e01-456c-37401a4268f2/14UMGIM60337.rgb.jpg/300x300bb.jpg" },
    { title: "Way Down We Go", artist: "KALEO", src: "/audio/lockin_6.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/74/fb/5e/74fb5e22-3a1b-4468-dc14-e097dc635e44/075679911506.jpg/300x300bb.jpg" },
    { title: "The Nights", artist: "Avicii", src: "/audio/lockin_7.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Arjan Vailly", artist: "Bhupinder Babbal", src: "/audio/lockin_8.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Kar Har Maidaan Fateh", artist: "Sukhwinder Singh", src: "/audio/lockin_9.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Brothers Anthem", artist: "Vishal-Shekhar", src: "/audio/lockin_10.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Zinda", artist: "Amit Trivedi", src: "/audio/lockin_11.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
  ],
  ride: [
    { title: "After Dark", artist: "Mr.Kitty", src: "/audio/ride_0.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/ce/5d/c6/ce5dc65e-6dac-bb8a-daaf-72bf77d0ba75/616450974909.png/300x300bb.jpg" },
    { title: "Midnight City", artist: "M83", src: "/audio/ride_1.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Sweater Weather", artist: "The Neighbourhood", src: "/audio/ride_2.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/71/00/287100fb-5c31-0195-5343-e6b3625886d0/886443969834.jpg/300x300bb.jpg" },
    { title: "Heat Waves", artist: "Glass Animals", src: "/audio/ride_3.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Husn", artist: "Anuv Jain", src: "/audio/ride_4.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Kho Gaye Hum Kahan", artist: "Jasleen Royal & Prateek Kuhad", src: "/audio/ride_5.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "O Sanam", artist: "Lucky Ali", src: "/audio/ride_6.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/2a/de/24/2ade24e0-6d5a-743e-82ab-d978ef2e4f7e/886448930501.jpg/300x300bb.jpg" },
    { title: "Kasoor", artist: "Prateek Kuhad", src: "/audio/ride_7.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/60/d3/e9/60d3e9b3-4991-16bd-1468-ce522245c9e2/cover.jpg/300x300bb.jpg" },
    { title: "Sajni", artist: "Jal", src: "/audio/ride_8.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2a/ad/78/2aad789c-f570-3d56-310a-f0a2b1d46198/8901854001521.jpg/300x300bb.jpg" },
    { title: "Choo Lo", artist: "The Local Train", src: "/audio/ride_9.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Paradise", artist: "Coldplay", src: "/audio/ride_10.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/fa/41/1c/fa411c37-7a65-8a3e-71c9-4b566c49617c/5099967983858_1562x1562_300dpi.jpg/300x300bb.jpg" },
    { title: "Nightcall", artist: "Kavinsky", src: "/audio/ride_11.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
  ],
  chill: [
    { title: "Experience", artist: "Ludovico Einaudi", src: "/audio/chill_0.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ad/11/b0/ad11b0f3-3389-a2ab-3d66-41fca2226e98/21UMGIM96807.rgb.jpg/300x300bb.jpg" },
    { title: "Time", artist: "Hans Zimmer", src: "/audio/chill_1.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2b/62/eb/2b62ebd7-aa99-988a-0fee-714162f6fbeb/093624965008.jpg/300x300bb.jpg" },
    { title: "Cornfield Chase", artist: "Hans Zimmer", src: "/audio/chill_2.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/5b/73/f45b735a-8d7a-9713-b217-0f8e1593c28b/794043201943.jpg/300x300bb.jpg" },
    { title: "Interstellar Main Theme", artist: "Hans Zimmer", src: "/audio/chill_3.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/6e/e6/5a/6ee65a66-8501-50d0-9cf9-b0f8387266f8/859764605361_cover.jpg/300x300bb.jpg" },
    { title: "Nuvole Bianche", artist: "Ludovico Einaudi", src: "/audio/chill_4.m4a", artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80" },
    { title: "Sunset Lover", artist: "Petit Biscuit", src: "/audio/chill_5.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/78/1c/93/781c934a-c233-cfce-39db-31f7284969b4/cover.jpg/300x300bb.jpg" },
    { title: "Baarishein", artist: "Anuv Jain", src: "/audio/chill_6.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/81/d1/2e/81d12e71-c993-272a-d559-5a1411f8d8ed/23UM1IM11036.rgb.jpg/300x300bb.jpg" },
    { title: "Gul", artist: "Anuv Jain", src: "/audio/chill_7.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/7a/4a/f7/7a4af7ac-fc6c-7c8c-83fd-ff3d6fbd08a5/23UM1IM11084.rgb.jpg/300x300bb.jpg" },
    { title: "Iktara", artist: "Amit Trivedi", src: "/audio/chill_8.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/ab/21/b9/ab21b901-5aeb-aba0-69b5-3ed200e0fe5c/886445021073.jpg/300x300bb.jpg" },
    { title: "Until I Found You", artist: "Stephen Sanchez", src: "/audio/chill_9.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/d2/c5/64d2c511-67f4-ae09-5153-d39c3da413a3/21UMGIM75467.rgb.jpg/300x300bb.jpg" },
  ],
};
