export interface Track {
  title: string;
  artist: string;
  src: string;
  artwork: string;
}

export const PLAYLISTS: Record<string, Track[]> = {
  lockin: [
    { title: "Run Boy Run", artist: "Woodkid", src: "/audio/lockin_0.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/21/cf/34/21cf34f6-02e0-2646-dfb9-4a0b58e7bd23/3610156947239.jpg/300x300bb.jpg" },
    { title: "Legends Never Die", artist: "Against The Current", src: "/audio/lockin_1.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/11/a4/c8/11a4c8a2-23c8-0cb8-9b0f-8b9a52bcbb8c/075679883582.jpg/300x300bb.jpg" },
    { title: "Believer", artist: "Imagine Dragons", src: "/audio/lockin_2.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a4/3a/70/a43a7008-01e4-9efc-7a6c-0e01a4268f2f/17UMGIM22368.rgb.jpg/300x300bb.jpg" },
    { title: "Centuries", artist: "Fall Out Boy", src: "/audio/lockin_3.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/ea/5f/87/ea5f87ea-4bc3-0e01-456c-37401a4268f2/14UMGIM60337.rgb.jpg/300x300bb.jpg" },
    { title: "Metamorphosis", artist: "INTERWORLD", src: "/audio/lockin_4.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/60/a4/76/60a47683-fc0c-96b0-6421-483d735cd93d/5056030623259.jpg/300x300bb.jpg" },
    { title: "Kar Har Maidaan Fateh", artist: "Sukhwinder Singh", src: "/audio/lockin_5.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/d5/4b/39/d54b3970-22db-35a0-bebf-54cb3a4ef5db/886447158777.jpg/300x300bb.jpg" },
  ],
  ride: [
    { title: "Memory Reboot", artist: "VØJ & Narvent", src: "/audio/ride_0.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/a4/09/a6/a409a6de-7bfa-c0db-ddb5-a3424d5ea4e4/cover.jpg/300x300bb.jpg" },
    { title: "After Dark", artist: "Mr.Kitty", src: "/audio/ride_1.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/ce/5d/c6/ce5dc65e-6dac-bb8a-daaf-72bf77d0ba75/616450974909.png/300x300bb.jpg" },
    { title: "Little Dark Age", artist: "MGMT", src: "/audio/ride_2.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/b8/67/35/b86735e0-824f-efd2-3591-6bc7fb2bdf7f/886446736419.jpg/300x300bb.jpg" },
    { title: "Nightcall", artist: "Kavinsky", src: "/audio/ride_3.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/b0/02/76/b00276cf-0cd5-9db8-4034-780c74dc594a/3256930018449.jpg/300x300bb.jpg" },
    { title: "Sweater Weather", artist: "The Neighbourhood", src: "/audio/ride_4.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/71/00/287100fb-5c31-0195-5343-e6b3625886d0/886443969834.jpg/300x300bb.jpg" },
    { title: "Midnight City", artist: "M83", src: "/audio/ride_5.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/64/00/39/6400395f-9e76-47b2-6cb1-37d40eb8d790/7090014856011.jpg/300x300bb.jpg" },
    { title: "The Nights", artist: "Avicii", src: "/audio/ride_6.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/71/ea/06/71ea06aa-6744-8cb3-1596-f13d80d7c71d/14UMGIM47867.rgb.jpg/300x300bb.jpg" },
    { title: "Way Down We Go", artist: "KALEO", src: "/audio/ride_7.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/74/fb/5e/74fb5e22-3a1b-4468-dc14-e097dc635e44/075679911506.jpg/300x300bb.jpg" },
  ],
  chill: [
    { title: "Past Lives", artist: "sapientdream & Slushii", src: "/audio/chill_0.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/aa/6a/c7/aa6ac786-9051-512b-3e5e-5fb0e12d4d8c/cover.jpg/300x300bb.jpg" },
    { title: "Experience", artist: "Ludovico Einaudi", src: "/audio/chill_1.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ad/11/b0/ad11b0f3-3389-a2ab-3d66-41fca2226e98/21UMGIM96807.rgb.jpg/300x300bb.jpg" },
    { title: "Time", artist: "Hans Zimmer", src: "/audio/chill_2.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2b/62/eb/2b62ebd7-aa99-988a-0fee-714162f6fbeb/093624965008.jpg/300x300bb.jpg" },
    { title: "Cornfield Chase", artist: "Hans Zimmer", src: "/audio/chill_3.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/5b/73/f45b735a-8d7a-9713-b217-0f8e1593c28b/794043201943.jpg/300x300bb.jpg" },
    { title: "Husn", artist: "Anuv Jain", src: "/audio/chill_4.m4a", artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/19/db/d1/19dbd1bb-20e8-090c-512e-131db22d7ec5/cover.jpg/300x300bb.jpg" },
  ],
};
