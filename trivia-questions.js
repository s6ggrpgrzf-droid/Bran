'use strict';

const TRIVIA_QUESTIONS = [

  // ── Naruto (original series + Shippuden only) ─────────────────────────

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the true name of the One-Tailed beast sealed inside Gaara?',
    answers: ['Kurama','Gyuki','Shukaku','Chomei'], correct: 2 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'Which kekkei genkai does Haku wield, combining water and wind nature transformations?',
    answers: ['Boil Release','Ice Release','Storm Release','Blaze Release'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What forbidden jutsu does Chiyo use to restore Gaara\'s life at the cost of her own?',
    answers: ['Edo Tensei','Rinne Rebirth','One\'s Own Life Reincarnation','Living Corpse Reincarnation'], correct: 2 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What specific ability does Shisui Uchiha\'s Mangekyo Sharingan grant — the one Danzo covets?',
    answers: ['Tsukuyomi','Amaterasu','Kotoamatsukami','Kamui'], correct: 2 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What kekkei tota (three-nature combination) does the Third Tsuchikage Onoki use?',
    answers: ['Storm Release','Scorch Release','Dust Release','Magnet Release'], correct: 2 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'Who is the original founder of the Akatsuki, before Nagato took leadership?',
    answers: ['Konan','Obito','Yahiko','Kisame'], correct: 2 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the name of the technique Minato uses to instantly teleport to marked kunai?',
    answers: ['Body Flicker Technique','Flying Thunder God Technique','Space-Time Migration','Hiraishin Barrier'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'Which tailed beast is sealed inside Yugito Nii of Kumogakure?',
    answers: ['One-Tail','Two-Tails','Three-Tails','Four-Tails'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the name of Orochimaru\'s technique for transferring his soul into a new host body?',
    answers: ['Soul Migration Jutsu','Living Corpse Reincarnation','Body Replacement Technique','Cursed Seal Transfer'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the exact name of the Uchiha\'s ultimate defensive and offensive chakra avatar?',
    answers: ['Susanoo','Totsuka Blade','Amaterasu','Izanagi'], correct: 0 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What specific requirement must be met to awaken the Eternal Mangekyo Sharingan?',
    answers: ['Kill your best friend','Transplant a direct blood relative\'s Mangekyo eyes','Witness a loved one die','Use Tsukuyomi 100 times'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the name of the massive collaborative jutsu Naruto and Minato use against Obito as the Ten-Tails jinchuriki?',
    answers: ['Spiralling Flash Super Strong Punch','Parent and Child Rasengan','Tailed Beast Rasengan Barrage','Ultra-Big Ball Rasenshuriken'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the name of the sealing barrier used during the Nine-Tails\' attack on Konoha that required four Kage-level shinobi?',
    answers: ['Four Crimson Ray Formation','Eight Trigrams Sealing Style','Dead Demon Consuming Seal','Four Red Yang Formation'], correct: 0 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'Which Hidden Village possesses the kekkei genkai known as the Shikotsumyaku (dead bone pulse)?',
    answers: ['Hidden Sound','Hidden Mist','Hidden Stone','Hidden Grass'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the name of Konan\'s suicide-bomb technique involving hundreds of billions of explosive paper tags?',
    answers: ['Paper Person of God','Shikigami Dance','Six Hundred Billion Paper Bombs','Dance of the God Tree'], correct: 2 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What organisation within Konoha did Danzo secretly lead?',
    answers: ['ANBU Black Ops','Foundation (Ne)','Uchiha Military Police','ROOT'], correct: 3 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the unique drawback of the Izanagi Sharingan technique?',
    answers: ['Blinds the user permanently in that eye','Drains all chakra','Kills the user after 60 seconds','Can only be used once — the eye seals shut permanently'], correct: 3 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is Killer B\'s tailed beast, the Eight-Tails, also known as?',
    answers: ['Kokuo','Gyuki','Saiken','Isobu'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'In what way does Black Zetsu differ from White Zetsu in terms of origin?',
    answers: ['Black Zetsu is Hashirama\'s will given form','Black Zetsu is Kaguya\'s will manifested','Black Zetsu is Madara\'s shadow clone','Black Zetsu was created by Obito'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the name of the blade sealed within Itachi\'s Susanoo that can seal anything it pierces?',
    answers: ['Sword of Kagutsuchi','Yata Mirror','Totsuka Blade','Sword of Nunoboko'], correct: 2 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'Which character transplants Hashirama\'s Wood Release cells into multiple shinobi to suppress tailed beasts during the war?',
    answers: ['Kabuto','Yamato','Madara','Obito'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the technique Nagato uses to destroy the entire Hidden Leaf Village in one sweeping strike?',
    answers: ['Planetary Devastation','Almighty Push (Shinra Tensei)','Universal Pull','Chibaku Tensei'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the name of the Hidden Village in the Land of Whirlpools where Kushina Uzumaki is originally from?',
    answers: ['Uzushiogakure','Uzumakigakure','Whirlpool Hidden Village','Kirigakure'], correct: 0 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What specific sensory ability does the Byakugan possess that the Sharingan lacks?',
    answers: ['Can copy techniques','Near 360-degree vision (with a small blind spot)','Can predict the future','Casts genjutsu passively'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the name of Pain\'s technique that creates a gravitational sphere, trapping targets in a mock moon?',
    answers: ['Planetary Devastation (Chibaku Tensei)','Almighty Push','Shinra Tensei Burst','Outer Path: Samsara of Heavenly Life'], correct: 0 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'Who was the first person to defeat Kakuzu, eventually exposing his heart threads — ending his immortality run?',
    answers: ['Shikamaru','Naruto','Kakashi','Ino-Shika-Cho formation'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the name of the Eight Inner Gates technique Guy opens in his final battle against Madara?',
    answers: ['Eight Gates Released Formation','Evening Elephant','Night Guy','Hachimon Tonkou no Jin'], correct: 0 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the forbidden technique Kabuto uses that improves on the original Edo Tensei?',
    answers: ['Impure World Resurrection','Reanimation Kai','Modified Edo Tensei','Kabuto\'s Edo Tensei has no special name'], correct: 3 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the name of the Akatsuki pair assigned to capture the Three-Tails?',
    answers: ['Hidan and Kakuzu','Deidara and Tobi','Kisame and Itachi','Konan and Nagato'], correct: 1 },

  { series:'naruto', seriesLabel:'Naruto 🍥', seriesColor:'#f97316',
    q: 'What is the ultimate goal of the Infinite Tsukuyomi?',
    answers: ['Trap all humanity in an eternal dream','Give Madara infinite chakra','Create a new world','Resurrect Kaguya'], correct: 0 },

  // ── Inuyasha ──────────────────────────────────────────────────────────

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What material was used by Totosai to forge the Tessaiga?',
    answers: ['Dragon bone','Fang of Inuyasha\'s father the Inu no Taisho','Shikon Jewel shard','Sacred iron ore'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What is the name of Sesshomaru\'s sword that was forged from his own body and can kill 100 demons per swing?',
    answers: ['Tenseiga','Tessaiga','Bakusaiga','Sounga'], correct: 2 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What is Naraku\'s true form before he became a half-demon — who was he originally?',
    answers: ['A wolf demon named Onigumo','A human bandit named Onigumo','A spider demon from the west','A spider-human hybrid priest'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What is the specific power of the Tenseiga that distinguishes it from all other swords?',
    answers: ['Cuts 100 demons at once','Can resurrect the dead by cutting the pallbearers of the underworld','Absorbs demon energy','Reflects any attack'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'Which of Naraku\'s detachments controls wind using a fan made from her own feathers?',
    answers: ['Kanna','Hakudoshi','Kagura','Byakuya'], correct: 2 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What is the origin of the Shikon Jewel — what is it actually made from?',
    answers: ['Demon king\'s soul condensed into stone','The fused souls of the priestess Midoriko and the demon she battled','A fragment of an ancient god\'s heart','A crystal purified by a thousand Miko'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What specific technique of Tessaiga exploits the gap in an enemy\'s demonic energy when attacking?',
    answers: ['Wind Scar','Backlash Wave','Adamant Barrage','Meidou Zangetsuha'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What happens to Miroku\'s Wind Tunnel if it absorbs Naraku\'s Saimyosho insects?',
    answers: ['It collapses and kills him','He becomes paralysed by poison','His hand disintegrates faster','The tunnel reverses direction'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What is the name of the Meidou Zangetsuha technique and which sword originally uses it?',
    answers: ['Death Path Slash — Tenseiga','Black Hole Rend — Bakusaiga','Meidou Crescent — Tessaiga (transferred from Tenseiga)','Void Slash — Sounga'], correct: 2 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'Which of Naraku\'s detachments has no heart or emotions and uses a mirror to reflect souls?',
    answers: ['Kagura','Hakudoshi','Kanna','Byakuya'], correct: 2 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What is the relationship between Kikyo and Kagome in terms of their souls?',
    answers: ['They share a piece of the Shikon Jewel','Kagome is the reincarnation of Kikyo','They are twins separated at birth','Kagome absorbed Kikyo\'s power'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What is the exact curse placed on Miroku\'s lineage by Naraku?',
    answers: ['Every first-born son becomes a demon','Each generation\'s Wind Tunnel grows until it devours the bearer','Every male will be killed by a demon at age 30','The lineage loses all spiritual power'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What are the Shikon Jewel shards embedded in Kouga\'s body used for?',
    answers: ['Give him immortality','Dramatically increase his speed','Allow him to control wolves','Give him the ability to regenerate'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What forbidden upgrade does Tessaiga receive from a dragon\'s venom, allowing it to shatter demonic barriers?',
    answers: ['Dragon Scale Tessaiga','Adamant Barrage','Venom Dragon Fang','Dragon Strike Tessaiga'], correct: 0 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What is the name of Sesshomaru\'s small two-headed dragon companion that serves as his steed?',
    answers: ['Jaken','Ah-Un','Rin\'s mount','Ryukotsusei'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What happens to Kohaku after Naraku places a Shikon shard in his back?',
    answers: ['He gains demon powers','He is kept alive but under Naraku\'s control with no memories of his crimes','He turns into a half-demon','He can see the future'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What hidden secret does the Shikon Jewel\'s true nature reveal about granting any wish?',
    answers: ['Destroys the world','It fuels the eternal battle between good and evil — no wish can end it cleanly','Resurrects the demon Midoriko fought','Grants the wisher immortality permanently'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'Which villain is revealed to be the incarnation of Naraku\'s heart?',
    answers: ['Kagura','Byakuya','Hakudoshi','Goshinki'], correct: 2 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What specific upgrade does Tessaiga gain after Inuyasha defeats Ryukotsusei?',
    answers: ['Barrier-breaking ability','Dragon Scale form','Dragon Strike','Flame Tessaiga'], correct: 0 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What is the name of Bankotsu\'s signature giant halberd weapon?',
    answers: ['The Banryu','The Tessaiga','The Bakusaiga','Sacred chain'], correct: 0 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'How does Naraku achieve his final, most powerful form?',
    answers: ['Absorbing Moryomaru','Absorbing all remaining Shikon Jewel shards','Through a pact with Kaguya','Consuming the Band of Seven\'s souls'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What is the nature of Kikyo\'s resurrection after her death?',
    answers: ['Soul fragments gathered in a clay body animated by graveyard soil','Reincarnation as a new being','Sealed in a crystal','A demon-magic copy'], correct: 0 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What is the name of the swordsmith responsible for forging both Tessaiga and Tenseiga?',
    answers: ['Jaken','Myoga','Totosai','Kaijinbo'], correct: 2 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What is the full name of the sacred tree that connects Inuyasha\'s era to Kagome\'s modern time?',
    answers: ['Bone-Eater\'s Well Tree','The Sacred God Tree (Goshinboku)','Higurashi Shrine Oak','The World Tree'], correct: 1 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What two elements does Inuyasha\'s Wind Scar exploit to damage enemies far beyond normal sword range?',
    answers: ['The gap between two opposing demonic energy flows','Spiritual energy and wind chakra','The demon\'s own aura reflected back','Sacred lightning and wind'], correct: 0 },

  { series:'inuyasha', seriesLabel:'Inuyasha ⚔️', seriesColor:'#9333ea',
    q: 'What triggers Inuyasha\'s full demon transformation when Tessaiga is absent?',
    answers: ['Full moon','Near death or extreme anger with Tessaiga removed','Presence of strong spider demons','Kagome saying "Sit"'], correct: 1 },

  // ── Star Wars ─────────────────────────────────────────────────────────

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is the specific name of Mace Windu\'s unique lightsaber combat form?',
    answers: ['Ataru (Form IV)','Shien (Form V)','Vaapad (Form VII)','Makashi (Form II)'], correct: 2 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is the exact clone trooper designation of Captain Rex?',
    answers: ['CC-7567','CT-7567','RC-1138','CC-2224'], correct: 1 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'Which Sith Lord established the Rule of Two — one master, one apprentice?',
    answers: ['Darth Plagueis','Darth Revan','Darth Bane','Darth Nihilus'], correct: 2 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is Palpatine\'s full given name as revealed in canon?',
    answers: ['Cos Palpatine','Hego Damask','Sheev Palpatine','Darth Sidious'], correct: 2 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is the hyperdrive class rating of the Millennium Falcon after Han Solo\'s modifications?',
    answers: ['Class 1.0','Class 0.5','Class 2.0','Class 0.75'], correct: 1 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'On which planet does Order 66 kill Jedi Master Ki-Adi-Mundi?',
    answers: ['Utapau','Mygeeto','Felucia','Kashyyyk'], correct: 1 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'Which planet is Obi-Wan Kenobi stated to be from in both Legends and canon?',
    answers: ['Coruscant','Alderaan','Stewjon','Mandalore'], correct: 2 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What species is the bounty hunter Bossk, who appears in The Empire Strikes Back?',
    answers: ['Rodian','Trandoshan','Weequay','Klatooinian'], correct: 1 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What was the original purpose of the clone troopers\' inhibitor chip?',
    answers: ['Force them to follow any Sith Lord\'s commands','Override free will and execute any Jedi near them when Order 66 was issued','Shut down clone production','Self-destruct near Jedi starfighters'], correct: 1 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is the specific model designation of the TIE Fighter used by Darth Vader in the original trilogy?',
    answers: ['TIE/IN Interceptor','TIE Advanced x1','TIE Bomber','TIE Defender'], correct: 1 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'Which planet is Anakin Skywalker born on and what is notable about his conception?',
    answers: ['Tatooine — he had no father; conceived by midi-chlorians','Coruscant — he was created by the Force in a lab','Tatooine — his mother was a slave who escaped Jabba','Naboo — he was the son of a Jedi Knight'], correct: 0 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is the name of the ancient Sith superweapon in Knights of the Old Republic that can build an unlimited army?',
    answers: ['Death Star','Star Forge','Darksaber','Mass Shadow Generator'], correct: 1 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is the name of the Clone Wars arc where Ahsoka Tano leaves the Jedi Order?',
    answers: ['The Wrong Jedi','The Lost One','Shattered','Voices'], correct: 0 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'Which Jedi Master secretly commissioned the creation of the clone army on Kamino?',
    answers: ['Count Dooku','Sifo-Dyas','Qui-Gon Jinn','Ki-Adi-Mundi'], correct: 1 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is the name of the Resistance\'s main base planet in The Force Awakens?',
    answers: ['Jakku','Takodana','D\'Qar','Crait'], correct: 2 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is the term used in-universe for a Force user who refuses both the Jedi and Sith paths, like the Bendu?',
    answers: ['Grey Jedi','Force Neutral','The One who stands in the middle','Ashla Force wielder'], correct: 2 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'Which battle is considered the turning point that directly led to the formation of the Rebel Alliance?',
    answers: ['Battle of Geonosis','Battle of Christophsis','Battle of Scarif','Battle of Mon Cala'], correct: 2 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What does the Darksaber represent to Mandalorian culture?',
    answers: ['A Sith relic to be destroyed','The right to rule Mandalore — its wielder commands the people','A sacred weapon that grants Force sensitivity','The first lightsaber ever built'], correct: 1 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is the real name of the Sith known as Darth Tyranus, Count of Serenno?',
    answers: ['Sifo-Dyas','Hego Damask','Dooku','Nute Gunray'], correct: 2 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What colour is Mace Windu\'s lightsaber, and why is it unique among all Jedi?',
    answers: ['Blue — he was a Temple Guardian','Green — he mastered Ataru','Purple — reflects his mastery channelling both light and dark side energies','White — signifies Grand Master rank'], correct: 2 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is the name of the Mandalorian covert\'s creed that Din Djarin follows?',
    answers: ['The Resol\'nare','The Mandalorian Way','The Way','Mandalorian Creed'], correct: 2 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is the name of the move Obi-Wan Kenobi is famous for performing against Anakin on Mustafar?',
    answers: ['The Soresu Shutdown','The High Ground Maneuver','Reverse Shien Bind','Saber Throw Finish'], correct: 1 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What is the Mandalorian\'s ship called before it is destroyed?',
    answers: ['Razor Crest','Slave I','Shadow Crest','Havoc Marauder'], correct: 0 },

  { series:'starwars', seriesLabel:'Star Wars ✨', seriesColor:'#eab308',
    q: 'What species is Ahsoka Tano?',
    answers: ['Togruta','Twi\'lek','Mirialan','Zabrak'], correct: 0 },

];
