# Foundry_WoD20
Changes to the rules

Removal of Appearance and Perception
Adding Composure and Resolve
Changing Wits

Changing Willpower

Additional abilities

1s doesn't remove success

Change Log

Fix i 1.0.5
- Added migration
- Added worldVersion system setting
- Spirit

Fix i 1.0.4
- Fixat kan inte slå gift med bara Rage/Gnosis/Willpower

Fix i 1.0.3
- Fixat färger för Macro-tärningar
- Fixat bredd på rutor i Notes
- Lagt till Spirit dice
- Lagt till Spirit CSS
- Fixat problem om man anfaller med vapen där man har spec i attribute
- Fixat bredd på specificationrutor attributes och ability
- Fixat bredd på bredd Experience på edit
- Fixat Soak macro tar inte bonus på slaget
- Fixat Macro Antal tärningar - kan inte se diff 
- Designat rader i lister lättare att läsa
- Designat slå tärningar till Chatt
- Designat skicka beskrivning till Chatt
- Flyttade visningen av beskrivning av gift/rites till ute i Foundry för testning

Fix i 1.0.2
- Fixa spec Willpower
- Skicka System om Gift/Rituals vid slag
- Kan sätta gift som aktiv
- Active Gifts som är märkta som Combat syns i Combat-fliken
- Bredd på abilities-och attributesrubriker fixade under Core
- Bredd på weaponnamn fixade
- Bredd på health under Combat fixade
- Visa total exp kvar på Core
- Komprimerat Exp på Notes

Fix i 1.0.1
- Döljer Edit/Delete-knappar om LOCKED.
- Översatt språk som glömts
- Visa totalt Earned Experience och Spent Experience
- Korrigera bredd på formulär och sätt max
- Hanterar bredd på Core och Shift
- Designa textarea (Bio och Gear)

Fix i 1.0.0
- Lägg till Specialities
- Edit Combat
- Feature form
- Experience item
- Korrigera utseendet för listning av gifts som ej har slag.
- Kommer upp i text när man använder grundegenskapen eller färdigheten i tärningsformuläret
- Använder man spec i tärningsslaget skall dess specialitet synas i chatt.
- feature: background
- feature: merits
- feature: flaws
- Design Notes
- Design Gear
- experience: (earned/spent)
- räkna total exp
- Om inte "klar" på spent exp är ikryssad visa inte kostnad och räkna inte den som spenderad
- Knapp - Skicka Description Gift + Rites till chatt

Fix i 0.3.8
- Töm Health Level högerklick
- Visa Attribute Total i settings
- Om ta bort fråga först
- Roll Damage
- Macro: Slå initiative
- Kunna modifiera initiativ bonus
- Soak beräknas baserat på form och typ av sheet
- Macro: Slå Soak
- Macro: Slå X st tärningar (t ex Willpower)

Fix i v0.3.7
- Sätta ut Rank
- Flytta upp Tab brevid upplåsningknapp
- Begränsa Gift baserat på Rank
- Lägga till History karaktär (Bio)
- Drag Rites
- List Rites
- Remove Rites
- Lägga Rite Description + System i Hinttext
- Man skall inte välja sitt wound level, detta skall systemet veta om genom : health.damage.woundlevel
- WoundPenalty
- Slå Attribute
- Slå Ability
- Slå Advantages
- Om noll eller negativa tärningar slå ej
- Skriv ut typ Dexterity (4) + Stealth (3) + 2 diff: x vid tärningsslag
- Skriv ut WoundPen i slaget
- Visa noll tärningar som resultat
- Visa Diff i slaget
- Visa Mod i slaget
- Roll Attack
- Hantera shift bonus på grundegenskaper
- Roll Gift
- Fixat om man klickar på samma form igen
- Om man uppdaterar så häller den inte shift bonus hela tiden
- Foundry v9.249
- Rite och Gifts difficulty (-1)
- Radiobutton difficulty

Fix i v0.3.6
- Added type to Power
- Added dice selection to Power
- Lagt till byta Actor bild
- Skapat Gift.html
- Skapat listorna för gift1-5
- Drag Gifts
- Remove Gifts
- Sätta Actor bild
- Combat gifts list
- Lägga Description + System i Hinttext med design... (tooltip)
- Fountry v9.245
- Designa hint-text
- Design Gifts

Fix i v0.3.5
- Werewolf: Shiftknapparna shiftar som de ska
- Werewolf: Shiftfunktionen vet vilken form den har varit och vilken den skall till
- Garanterat att om inga former så sätts Homid
- Garanterat att beräkningar på formuläret för Werewolf också körs om Mortal körs
- Lagt till ShiftMod och ShiftDiff som beräknas vid öppnande av Werewolf beroende vilken form som valts
- Syns vad man valt för form
- Design Shapeshift
- Visa vilken form
- Snygga till var formikonen finns

Fix i v0.3.4
- Lagt till mods och diffs på mortal för att hålla bonusar i slag
- Lagt till shiftmods och shiftdiffs på werewolf för att hålla bonusar vilken form de har
- Sorterat i GetData() för mortal och werewolf
- mortal öppnar mortal-sheet
- werewolf-actor-sheet.js har get template
- werewolf öppnar werewolf-sheet
- Shapeshift har egen html-fil
- Ersatt {{equalValue}} med {{iff}}
- Städat i console.log vid öppnande av sheet så det skrivs ut i rätt ordning

Fix i v0.3.3
- Design Armor
- Armor Drag
- Armor skapa
- Armor Ta Bort

Fix i v0.3.2
- Ranged Weapons skapa
- Ranged Weapons Drag
- Ranged Weapons alla Attribute
- Ranged Weapons ta bort
- Design Ranged Weapon
- Sätta Health Levels /, x, *
- Health Level hantering
- Välja health även om låst

Fix i v0.3.1
- Bygga om språkfilen
- Item Natural Weapon
- Item Melee Weapon
- Drag Natural Weapons
- Drag till Melee Weapons
- Ta bort Natural Weapons
- Ta bort Melee Weapons
- item.Roll attack och damage Natural Weapons
- item.Roll attack och damage Melee Weapons
- item.Roll attack och damage Ranged Weapons
- Visa ej skadekod om inte slå skada (som melee)
- Natural Weapons alla Attribute
- Melee Weapons alla Attribute
- Design Natural Weapon
- Design Melee Weapon
- Design Combat

Fix i v0.3
- Added bio.html
- Kan inte slå Gnosis
- Kan inte slå Rage
- Slå Gnosis, Rage, Willpower tar inte minsta mellan temp och perm
- Input visar ingen box om låst
- Settings: Kan inte spara Health values
- Nog fel i spara värde se _assignToActorField mortal.js
- Kan inte skriva i Appearance och Concept editor??
- bör ändra för att kunna ändra rage temp , gnosis temp, willpower temp, health typ även om locked css .locked .resource-value-empty och .locked .resource-value-step :not(.rage-value) 
- Sätta Renown
- Tömma temp Renown
- Design Bio

Fix i v0.2
- Design slå tärningar från formulär titta på marcro för ideer särskilt med färgschema beroende på vad för slags varelse som slår. Vampire finns, kvar, werewolf och mortal. Från CoD?
- Speciality dubblar inte success 10.
- Kan inte slå Skill + Attribute, detta blir Skill + Skill.
- Kan inte slå Attribute enbart
- Slå t ex willpower funkar inte
- Fel när öppnar werewolf sheet. (fick skapa en ny)
- Bytt namn på attribute.label
- Slår grundegenskap alltid en tärning
- Kan inte uppgradera systemet. (world.json)