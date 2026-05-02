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

  // ── Music ─────────────────────────────────────────────────────────────

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What was Michael Jackson\'s best-selling album of all time?',
    answers: ['Bad','HIStory','Thriller','Dangerous'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What is Lady Gaga\'s real name?',
    answers: ['Stefani Germanotta','Amanda Seyfried','Olivia Rodrigo','Ariana Grande'], correct: 0 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Beyoncé\'s \'Lemonade\' was released as what type of project in 2016?',
    answers: ['A concert film','A visual album','A documentary','A live album'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What was the first music video ever played on MTV on August 1, 1981?',
    answers: ['Beat It','Video Killed the Radio Star','Thriller','Material Girl'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which artist had a #1 hit with \'Rolling in the Deep\' in 2011?',
    answers: ['Amy Winehouse','Duffy','Adele','Lorde'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Taylor Swift\'s \'Fearless\' won Album of the Year at the Grammys in which year?',
    answers: ['2008','2009','2010','2011'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What is Katy Perry\'s birth name?',
    answers: ['Katheryn Hudson','Katherine Peterson','Katy Moore','Kristina Huber'], correct: 0 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which Spice Girl was known as \'Scary Spice\'?',
    answers: ['Victoria Beckham','Mel B','Emma Bunton','Mel C'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Justin Timberlake was a member of which boy band?',
    answers: ['Backstreet Boys','New Kids on the Block','*NSYNC','Boyz II Men'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Billie Eilish was the first person born in the 2000s to win which Grammy award?',
    answers: ['Best Pop Album','Best New Artist','Album of the Year','Song of the Year'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Lil Nas X\'s \'Old Town Road\' spent how many weeks at #1 on the Hot 100?',
    answers: ['12 weeks','15 weeks','19 weeks','22 weeks'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What was Britney Spears\' debut single?',
    answers: ['Oops!... I Did It Again','...Baby One More Time','Toxic','Womanizer'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which artist is known by the nickname \'Queen Bey\'?',
    answers: ['Rihanna','Beyoncé','Mariah Carey','Whitney Houston'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Madonna\'s \'Like a Prayer\' video featured burning crosses and imagery of which religious figure?',
    answers: ['A Priest','Saint Peter','A Black Jesus','The Pope'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which pop duo released \'Get Lucky\' and the album \'Random Access Memories\'?',
    answers: ['Daft Punk','Chemical Brothers','Disclosure','Röyksopp'], correct: 0 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'The Beatles were originally from which English city?',
    answers: ['London','Manchester','Liverpool','Birmingham'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What was Led Zeppelin\'s name before they added \'Led\'?',
    answers: ['The Yardbirds','The New Yardbirds','The Crawling Kingsnakes','The Honeydrippers'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which Pink Floyd album features a prism splitting white light on its cover?',
    answers: ['Wish You Were Here','Animals','The Dark Side of the Moon','The Wall'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Nirvana\'s landmark album \'Nevermind\' was released in what year?',
    answers: ['1989','1990','1991','1992'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which band did Dave Grohl form after Nirvana disbanded?',
    answers: ['Weezer','Pearl Jam','Soundgarden','Foo Fighters'], correct: 3 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Queen\'s \'Bohemian Rhapsody\' was released in which year?',
    answers: ['1973','1974','1975','1976'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which guitarist is nicknamed \'Slowhand\'?',
    answers: ['Jimi Hendrix','Eric Clapton','Jimmy Page','Carlos Santana'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which band released \'Rumours\' in 1977, one of the best-selling albums ever?',
    answers: ['Eagles','Fleetwood Mac','Crosby, Stills & Nash','Steely Dan'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'AC/DC\'s original vocalist before Brian Johnson was?',
    answers: ['Steve Young','Bon Scott','Rob Bailey','Dave Evans'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which Radiohead album featured \'Karma Police\' and \'Paranoid Android\'?',
    answers: ['Pablo Honey','The Bends','OK Computer','Kid A'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Kurt Cobain died in what year?',
    answers: ['1992','1993','1994','1995'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which band performed a legendary set at Live Aid 1985 often called the greatest rock performance ever?',
    answers: ['Led Zeppelin','The Who','Queen','U2'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'David Bowie\'s alter ego \'Ziggy Stardust\' appeared on which album?',
    answers: ['Heroes','Diamond Dogs','The Rise and Fall of Ziggy Stardust and the Spiders from Mars','Young Americans'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which guitarist played the famous \'Smoke on the Water\' riff for Deep Purple?',
    answers: ['Tommy Bolin','Ritchie Blackmore','Joe Satriani','Steve Morse'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which guitarist set his guitar on fire at the Monterey Pop Festival in 1967?',
    answers: ['Pete Townshend','Eric Clapton','Jimi Hendrix','Carlos Santana'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: '\'Hotel California\' features a famous dual guitar solo by Don Felder and which other Eagles guitarist?',
    answers: ['Glenn Frey','Joe Walsh','Timothy B. Schmit','Bernie Leadon'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What city is the band R.E.M. originally from?',
    answers: ['Atlanta, Georgia','Nashville, Tennessee','Athens, Georgia','Austin, Texas'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which album by The Clash is often cited as the greatest punk album ever made?',
    answers: ['Give \'Em Enough Rope','London Calling','Sandinista!','Combat Rock'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Black Sabbath\'s self-titled debut album was released on which notoriously unlucky date in 1970?',
    answers: ['April Fools\' Day','Halloween','Friday the 13th','February 13th'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Bruce Springsteen\'s breakthrough album \'Born to Run\' was released in what year?',
    answers: ['1973','1974','1975','1976'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What is Eminem\'s real name?',
    answers: ['Marshall Mathers','Stuart Mathers','Eric Mathers','Matthew Mathers'], correct: 0 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Dr. Dre\'s landmark solo album \'2001\' was released in what year?',
    answers: ['1997','1998','1999','2000'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Jay-Z\'s birth name is?',
    answers: ['Shawn Carter','Calvin Broadus','Aubrey Graham','Tauheed Epps'], correct: 0 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which Kendrick Lamar album won the Pulitzer Prize for Music in 2018?',
    answers: ['good kid, m.A.A.d city','To Pimp a Butterfly','DAMN.','Mr. Morale & The Big Steppers'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Notorious B.I.G. was from which neighborhood in New York?',
    answers: ['South Bronx','Harlem','Brooklyn','Queens'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Nicki Minaj\'s real name is?',
    answers: ['Onika Tanya Maraj','Cardi B','Missy Elliott','Lil\' Kim'], correct: 0 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Wu-Tang Clan originates from which New York City borough?',
    answers: ['Brooklyn','The Bronx','Queens','Staten Island'], correct: 3 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which R&B singer is known as the \'Queen of Soul\'?',
    answers: ['Whitney Houston','Diana Ross','Aretha Franklin','Patti LaBelle'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Tupac Shakur died in what year?',
    answers: ['1994','1995','1996','1997'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Drake was born and raised in which city?',
    answers: ['Los Angeles','Houston','Atlanta','Toronto'], correct: 3 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Kanye West\'s debut album \'The College Dropout\' was released in what year?',
    answers: ['2002','2003','2004','2005'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Prince\'s breakthrough movie and soundtrack album \'Purple Rain\' was released in what year?',
    answers: ['1982','1983','1984','1985'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which rapper was born Dwayne Michael Carter Jr.?',
    answers: ['T.I.','Birdman','Lil Wayne','Young Jeezy'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Beyoncé was originally a member of which group?',
    answers: ['En Vogue','TLC','Destiny\'s Child','Salt-N-Pepa'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Marvin Gaye\'s landmark album \'What\'s Going On\' was released in what year?',
    answers: ['1969','1970','1971','1972'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which rapper\'s debut album was \'Illmatic\' (1994), considered one of hip-hop\'s greatest?',
    answers: ['Jay-Z','Nas','Biggie','Rakim'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Stevie Wonder\'s \'Superstition\' was originally written for which other artist?',
    answers: ['Marvin Gaye','Jeff Beck','James Brown','Michael Jackson'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Cardi B\'s debut studio album is titled what?',
    answers: ['Invasion of Privacy','Gangsta Bitch Music','Money Moves','Press'], correct: 0 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'OutKast\'s \'Speakerboxxx/The Love Below\' won Grammy Album of the Year in what year?',
    answers: ['2002','2003','2004','2005'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which Motown artist recorded the original \'I Heard It Through the Grapevine\'?',
    answers: ['The Temptations','Marvin Gaye','Smokey Robinson','The Four Tops'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which composer wrote \'The Four Seasons\'?',
    answers: ['Bach','Handel','Vivaldi','Telemann'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Beethoven\'s \'Ode to Joy\' theme appears in which of his symphonies?',
    answers: ['5th Symphony','7th Symphony','9th Symphony','3rd Symphony'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which Mozart opera features the aria \'The Queen of the Night\'?',
    answers: ['Don Giovanni','Così fan tutte','The Marriage of Figaro','The Magic Flute'], correct: 3 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which composer wrote the piano piece \'Clair de lune\'?',
    answers: ['Ravel','Debussy','Chopin','Satie'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Beethoven\'s \'Moonlight Sonata\' is officially subtitled what?',
    answers: ['Quasi una fantasia','Per Elisa','Pathétique','Waldstein'], correct: 0 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'How many keys does a standard modern piano have?',
    answers: ['76','80','88','96'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which composer wrote \'The Nutcracker\' ballet?',
    answers: ['Stravinsky','Prokofiev','Brahms','Tchaikovsky'], correct: 3 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What does the musical term \'pianissimo\' mean?',
    answers: ['Very loud','Moderately soft','Very soft','Gradually getting louder'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Johann Sebastian Bach composed how many Brandenburg Concertos?',
    answers: ['4','5','6','7'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What is the technique where a string player plucks the strings instead of bowing?',
    answers: ['Col legno','Pizzicato','Sul ponticello','Tremolo'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Who is known as \'The Man in Black\'?',
    answers: ['Hank Williams','Waylon Jennings','Johnny Cash','Willie Nelson'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Dolly Parton wrote \'I Will Always Love You\', which became an even bigger hit when covered by whom?',
    answers: ['Celine Dion','Mariah Carey','Whitney Houston','Toni Braxton'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which city is known as the undisputed home of country music?',
    answers: ['Austin','Memphis','Nashville','Atlanta'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which country artist had the smash hit \'Friends in Low Places\'?',
    answers: ['Alan Jackson','Tim McGraw','Garth Brooks','Kenny Chesney'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'The 1980 film \'Coal Miner\'s Daughter\' is a biopic about which country legend?',
    answers: ['Dolly Parton','Tammy Wynette','Loretta Lynn','Patsy Cline'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What is the name of Willie Nelson\'s famous, heavily-worn guitar?',
    answers: ['Lucille','Trigger','Blackie','Betsy'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which country duo recorded \'Jackson\', winning a Grammy for Best Country Performance?',
    answers: ['Loretta Lynn & Conway Twitty','Kenny Rogers & Dolly Parton','Johnny Cash & June Carter Cash','Tammy Wynette & George Jones'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Hank Williams died on January 1, 1953, at just 29 years old. What contributed to his death?',
    answers: ['Plane crash','Drug overdose','Heart failure from alcohol and drug use','Automobile accident'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Shania Twain\'s \'Come On Over\' (1997) became the best-selling album ever by a?',
    answers: ['Canadian artist','Female solo artist','Country artist','Debut artist'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which Nashville venue, known as the \'Mother Church of Country Music\', has broadcast a weekly radio show since 1927?',
    answers: ['The Bluebird Cafe','The Ryman Auditorium','The Grand Ole Opry','The Station Inn'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Motown Records was founded by Berry Gordy in which city?',
    answers: ['Chicago','Atlanta','New York','Detroit'], correct: 3 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'The Woodstock Music Festival took place in which year?',
    answers: ['1967','1968','1969','1970'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which producer developed the \'Wall of Sound\' recording technique in the early 1960s?',
    answers: ['George Martin','Phil Spector','Brian Wilson','Berry Gordy'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'How many cover versions of The Beatles\' \'Yesterday\' are estimated to exist?',
    answers: ['Over 1,000','Over 2,000','Over 3,000','Over 4,000'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Bob Dylan was awarded the Nobel Prize in Literature in which year?',
    answers: ['2014','2015','2016','2017'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Who holds the record for most Grammy wins of all time (as of 2024)?',
    answers: ['Taylor Swift','Beyoncé','Adele','Alicia Keys'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'The 12-bar blues chord progression uses which three scale degrees?',
    answers: ['I, IV, V','I, II, V','I, III, IV','II, IV, VI'], correct: 0 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Bob Marley was a pioneer of which Jamaican music genre?',
    answers: ['Ska','Dancehall','Reggae','Rocksteady'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'The international standard concert pitch \'Concert A\' is tuned to what frequency?',
    answers: ['420 Hz','432 Hz','440 Hz','460 Hz'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which opera composer wrote the four-opera cycle \'Der Ring des Nibelungen\'?',
    answers: ['Verdi','Puccini','Wagner','Mozart'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What is the time signature of a waltz?',
    answers: ['2/4','4/4','3/4','6/8'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which electronic music genre emerged from Detroit in the early 1980s?',
    answers: ['House','Techno','Drum and Bass','Trance'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'The Beatles signed to which UK record label?',
    answers: ['Columbia','Parlophone','Decca','HMV'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which genre was pioneered in Chicago clubs in the early 1980s by DJs like Frankie Knuckles?',
    answers: ['House','Techno','Ambient','Acid Jazz'], correct: 0 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Elvis Presley\'s famous home in Memphis is called?',
    answers: ['Neverland','Graceland','Beachwood','Sunrise Manor'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'A musical piece composed for eight performers is called a/an?',
    answers: ['Sextet','Septet','Octet','Nonet'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which jazz musician is credited as a founding father of bebop?',
    answers: ['Miles Davis','Louis Armstrong','Charlie Parker','Duke Ellington'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'The term \'a cappella\' means singing without what?',
    answers: ['Rhythm section','Instrumental accompaniment','A conductor','Sheet music'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What is a \'B-side\' in the context of a music single?',
    answers: ['A slower version of the hit song','A secondary track on the flip side of a vinyl single','A bass-heavy remix','The second single from an album'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'The music genre \'bossa nova\' originated in which country?',
    answers: ['Argentina','Cuba','Brazil','Mexico'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which record label, founded in Detroit in 1959, was home to The Supremes and Marvin Gaye?',
    answers: ['Stax','Atlantic','Motown','Chess'], correct: 2 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Jimi Hendrix\'s famous cover of \'All Along the Watchtower\' was originally written by?',
    answers: ['Eric Clapton','Bob Dylan','Pete Seeger','Chuck Berry'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'What does \'BPM\' stand for in music production?',
    answers: ['Bass per measure','Beats per minute','Bars per mix','Beats per mix'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'The \'British Invasion\' of American pop culture in the early 1960s was largely kicked off by which band?',
    answers: ['The Rolling Stones','The Beatles','The Who','The Kinks'], correct: 1 },

  { series:'music', seriesLabel:'Music 🎵', seriesColor:'#22d3ee',
    q: 'Which legendary Memphis studio recorded Elvis Presley, Johnny Cash, Jerry Lee Lewis, and Carl Perkins?',
    answers: ['RCA Studio B','Muscle Shoals Sound Studio','Sun Studio','Chess Records Studio'], correct: 2 },

  // ── Lyrics (current music — guess the song from the lyric) ────────────

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"That\'s that me, espresso…"',
    answers: ['Espresso — Sabrina Carpenter','Houdini — Dua Lipa','greedy — Tate McRae','yes, and? — Ariana Grande'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Please, please, please / Don\'t prove I\'m right…"',
    answers: ['Houdini — Dua Lipa','Please Please Please — Sabrina Carpenter','greedy — Tate McRae','Birds of a Feather — Billie Eilish'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Every time you close your eyes / You\'ll taste me on your tongue…"',
    answers: ['Lunch — Billie Eilish','Espresso — Sabrina Carpenter','Taste — Sabrina Carpenter','Apple — Charli XCX'], correct: 2 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"It\'s me, hi, I\'m the problem, it\'s me…"',
    answers: ['Cruel Summer — Taylor Swift','Anti-Hero — Taylor Swift','vampire — Olivia Rodrigo','Flowers — Miley Cyrus'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"And it\'s new, the shape of your body / It\'s blue, the feeling I\'ve got…"',
    answers: ['Anti-Hero — Taylor Swift','Fortnight — Taylor Swift','Cruel Summer — Taylor Swift','vampire — Olivia Rodrigo'], correct: 2 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I was a functioning alcoholic / \'Til nobody noticed my new aesthetic…"',
    answers: ['Cruel Summer — Taylor Swift','Anti-Hero — Taylor Swift','good 4 u — Olivia Rodrigo','Fortnight — Taylor Swift'], correct: 3 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Hate to give the satisfaction asking how you\'re doing now…"',
    answers: ['drivers license — Olivia Rodrigo','vampire — Olivia Rodrigo','Anti-Hero — Taylor Swift','good 4 u — Olivia Rodrigo'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I got my driver\'s license last week / Just like we always talked about…"',
    answers: ['drivers license — Olivia Rodrigo','Cruel Summer — Taylor Swift','Birds of a Feather — Billie Eilish','Saturn — SZA'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Well, good for you, I guess you moved on really easily…"',
    answers: ['good 4 u — Olivia Rodrigo','vampire — Olivia Rodrigo','drivers license — Olivia Rodrigo','Anti-Hero — Taylor Swift'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"And when you wake up next to him in the middle of the night / With your head in your hands, you\'re nothing more than his wife…"',
    answers: ['HOT TO GO! — Chappell Roan','Pink Pony Club — Chappell Roan','Good Luck, Babe! — Chappell Roan','Espresso — Sabrina Carpenter'], correct: 2 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I\'m gonna keep on dancin\' at the Pink Pony Club…"',
    answers: ['Pink Pony Club — Chappell Roan','HOT TO GO! — Chappell Roan','Good Luck, Babe! — Chappell Roan','Apple — Charli XCX'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"H-O-T-T-O-G-O / You can take me hot to go…"',
    answers: ['Good Luck, Babe! — Chappell Roan','HOT TO GO! — Chappell Roan','Pink Pony Club — Chappell Roan','360 — Charli XCX'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I want you to stay / \'Til I\'m in the grave…"',
    answers: ['Lunch — Billie Eilish','Birds of a Feather — Billie Eilish','Saturn — SZA','Snooze — SZA'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I could eat that girl for lunch…"',
    answers: ['Birds of a Feather — Billie Eilish','Lunch — Billie Eilish','Apple — Charli XCX','360 — Charli XCX'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Catch me or I go Houdini…"',
    answers: ['Houdini — Dua Lipa','Training Season — Dua Lipa','Espresso — Sabrina Carpenter','greedy — Tate McRae'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Are you someone that I could give my heart to? / Or just the poison that I\'m drawn to?"',
    answers: ['Houdini — Dua Lipa','Training Season — Dua Lipa','vampire — Olivia Rodrigo','Anti-Hero — Taylor Swift'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"We can\'t be friends, but I\'d like to just pretend…"',
    answers: ['yes, and? — Ariana Grande','we can\'t be friends — Ariana Grande','Saturn — SZA','Birds of a Feather — Billie Eilish'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Now, I\'m so done with caring what you think…"',
    answers: ['we can\'t be friends — Ariana Grande','yes, and? — Ariana Grande','Houdini — Dua Lipa','Flowers — Miley Cyrus'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I can buy myself flowers / Write my name in the sand…"',
    answers: ['Flowers — Miley Cyrus','Anti-Hero — Taylor Swift','greedy — Tate McRae','Save Your Tears — The Weeknd'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"If the world was ending / I\'d wanna be next to you…"',
    answers: ['Beautiful Things — Benson Boone','Lose Control — Teddy Swims','Die With A Smile — Lady Gaga & Bruno Mars','Too Sweet — Hozier'], correct: 2 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I said, ooh, I\'m blinded by the lights…"',
    answers: ['Save Your Tears — The Weeknd','Blinding Lights — The Weeknd','Houdini — Dua Lipa','Snooze — SZA'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Save your tears for another day…"',
    answers: ['Blinding Lights — The Weeknd','Save Your Tears — The Weeknd','Lose Control — Teddy Swims','Too Sweet — Hozier'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I\'d rather be famous instead / Mm, I\'d rather be me…"',
    answers: ['Agora Hills — Doja Cat','Paint The Town Red — Doja Cat','greedy — Tate McRae','Houdini — Dua Lipa'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I just wanna show you off, show you off…"',
    answers: ['Paint The Town Red — Doja Cat','Agora Hills — Doja Cat','Water — Tyla','Lunch — Billie Eilish'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I can\'t lose when I\'m with you / Can\'t snooze, miss any moments with you…"',
    answers: ['Snooze — SZA','Saturn — SZA','Birds of a Feather — Billie Eilish','we can\'t be friends — Ariana Grande'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"If there\'s a point to losing love, repeating pain…"',
    answers: ['Saturn — SZA','Snooze — SZA','vampire — Olivia Rodrigo','Stick Season — Noah Kahan'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Make me sweat, make me hotter / Make me lose my breath, make me water…"',
    answers: ['Water — Tyla','Houdini — Dua Lipa','Agora Hills — Doja Cat','Snooze — SZA'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"This ain\'t Texas (woo), ain\'t no hold \'em…"',
    answers: ['TEXAS HOLD \'EM — Beyoncé','A Bar Song (Tipsy) — Shaboozey','Fast Car — Luke Combs','Last Night — Morgan Wallen'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"They not like us, they not like us, they not like us…"',
    answers: ['FE!N — Travis Scott','Not Like Us — Kendrick Lamar','MONACO — Bad Bunny','Calm Down — Rema & Selena Gomez'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Fein, fein, fein, fein, fein, fein…"',
    answers: ['MONACO — Bad Bunny','Not Like Us — Kendrick Lamar','FE!N — Travis Scott','Paint The Town Red — Doja Cat'], correct: 2 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Baby, calm down, calm down…"',
    answers: ['Water — Tyla','Calm Down — Rema & Selena Gomez','Houdini — Dua Lipa','Lose Control — Teddy Swims'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Yo siempre soñé con vivir en Mónaco…"',
    answers: ['MONACO — Bad Bunny','Calm Down — Rema & Selena Gomez','Water — Tyla','FE!N — Travis Scott'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I think I\'ll take my whiskey neat / My coffee black and my bed at three…"',
    answers: ['Beautiful Things — Benson Boone','Too Sweet — Hozier','Lose Control — Teddy Swims','Stick Season — Noah Kahan'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Please stay, I want you, I need you, oh God / Don\'t take these beautiful things that I\'ve got…"',
    answers: ['Beautiful Things — Benson Boone','Too Sweet — Hozier','Lose Control — Teddy Swims','Die With A Smile — Lady Gaga & Bruno Mars'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Got me losin\' my, losin\' my, losin\' my mind…"',
    answers: ['Lose Control — Teddy Swims','Too Sweet — Hozier','Beautiful Things — Benson Boone','Stick Season — Noah Kahan'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I would want myself / Baby, please, believe me…"',
    answers: ['exes — Tate McRae','greedy — Tate McRae','Espresso — Sabrina Carpenter','Houdini — Dua Lipa'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"All my exes live in cities / \'Cause I\'m hard to forget and they wanna be where I\'m at…"',
    answers: ['greedy — Tate McRae','exes — Tate McRae','Cruel Summer — Taylor Swift','Apple — Charli XCX'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I\'m everywhere, I\'m so Julia…"',
    answers: ['Apple — Charli XCX','360 — Charli XCX','HOT TO GO! — Chappell Roan','Houdini — Dua Lipa'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I think the apple\'s rotten right to the core / From all the things passed down…"',
    answers: ['360 — Charli XCX','Apple — Charli XCX','Lunch — Billie Eilish','Saturn — SZA'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"In five years maybe you\'ll like country songs / I\'ll miss your laugh, I hope I\'m wrong…"',
    answers: ['That\'s So True — Gracie Abrams','I Love You, I\'m Sorry — Gracie Abrams','drivers license — Olivia Rodrigo','Anti-Hero — Taylor Swift'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Yeah, you\'re so true / Stickin\' to her like that tattoo…"',
    answers: ['I Love You, I\'m Sorry — Gracie Abrams','That\'s So True — Gracie Abrams','Cruel Summer — Taylor Swift','exes — Tate McRae'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"And I love Vermont, but it\'s the season of the sticks…"',
    answers: ['Stick Season — Noah Kahan','Fast Car — Luke Combs','Heart Like A Truck — Lainey Wilson','Too Sweet — Hozier'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"One, here comes the two to the three to the four / Tell \'em, \'Pour it up\'…"',
    answers: ['Last Night — Morgan Wallen','A Bar Song (Tipsy) — Shaboozey','TEXAS HOLD \'EM — Beyoncé','Pour Me a Drink — Post Malone'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I had some help / It ain\'t like I can make this kind of mess all by myself…"',
    answers: ['I Had Some Help — Post Malone & Morgan Wallen','Last Night — Morgan Wallen','Pour Me a Drink — Post Malone','Need a Favor — Jelly Roll'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Last night, we let the liquor talk / I can\'t remember everything we said but we said it all…"',
    answers: ['I Had Some Help — Post Malone & Morgan Wallen','I Remember Everything — Zach Bryan & Kacey Musgraves','Last Night — Morgan Wallen','Pour Me a Drink — Post Malone'], correct: 2 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Rotgut whiskey\'s gonna ease my mind / Beach towel rests on the dryin\' line…"',
    answers: ['Last Night — Morgan Wallen','I Remember Everything — Zach Bryan & Kacey Musgraves','Stick Season — Noah Kahan','Fast Car — Luke Combs'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I got a heart like a truck / It\'s been drug through the mud…"',
    answers: ['Fast Car — Luke Combs','Heart Like A Truck — Lainey Wilson','TEXAS HOLD \'EM — Beyoncé','A Bar Song (Tipsy) — Shaboozey'], correct: 1 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"You got a fast car / I want a ticket to anywhere…"',
    answers: ['Fast Car — Luke Combs','Last Night — Morgan Wallen','Heart Like A Truck — Lainey Wilson','Stick Season — Noah Kahan'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"I only talk to God when I need a favor…"',
    answers: ['Need a Favor — Jelly Roll','Pour Me a Drink — Post Malone','Last Night — Morgan Wallen','Stick Season — Noah Kahan'], correct: 0 },

  { series:'lyrics', seriesLabel:'Lyrics 🎤', seriesColor:'#ec4899',
    q: '"Hey, bartender, pour me a drink / Make it strong \'cause I don\'t wanna think…"',
    answers: ['I Had Some Help — Post Malone & Morgan Wallen','Pour Me a Drink — Post Malone','A Bar Song (Tipsy) — Shaboozey','Need a Favor — Jelly Roll'], correct: 1 },

];
