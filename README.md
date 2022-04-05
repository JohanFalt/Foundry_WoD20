# Foundry WoD20

# Changes to the rules
1s doesn't remove success

## Willpower
Using the rules for Willpower from World of Darkness 5th edition. Your Composure + Resolve equals your permanent Willpower.
By spending a Willpower point you can reroll up to three dice to your roll. You can only reroll any dice on the roll and that isn't showing a success.

## Attributes
The attributes Appearance and Perception are removed and exchanged with the Social Attribute Composure and the Mental Attribute Resolve both from the World of Darkness 5th edition.

### Composure
Composure allows you to remain calm, to command your emotions, and to put others at ease despite anxiety. It is also represents your ability to stay cool in everything from firefights to intimate encounters.
Your Composure + Resolve equals your Willpower.

• The slightest insult or confrontation could drive you to frenzy.
•• You can subdue your predatory instincts in most non-hostile situations.
••• Others look to you for guidance when the blood spatter hits the fan.
•••• You can effortlessly bluff at cards.
••••• The inner emotions are your pet.

### Resolve
Resolve provides focus and determination, and measures concentration and mental fortitude. Resolve powers all-night watches and blocks out distractions.
Your Composure + Resolve equals your Willpower.

• You have minimal attention for all but the most pressing things.
•• You can settle in for the long haul, as long as it’s not too long.
••• Distracting you takes more effort than most other people want to spend.
•••• You can brute-force your way to a deduction past any obstacles.
••••• You can think in a gunfight or watch the door in a blood orgy and then clean up every
shell casing or spilled droplet.

### Wits
Changed to Wits from World of Darkness 5th edition. Wits are for thinking quickly and reacting correctly on little information. “You hear a sound” is Wits; “You hear two guards coming” is Intelligence. Wits let you smell an ambush or answer the Master of Rites back at the Moot right away, instead of thinking of the best response the next night. 
Wits replaces the old attribute of Perception. Normal perception roll if nothing really fits - Composure + Wits. 

• You get the point eventually, but it takes explaining.
•• You can bet the odds in poker or apply the emergency brakes in time. Usually.
••• You can analyze a situation and quickly work out the best escape route.
•••• You are never caught on the back foot and always come up with a smart riposte.
••••• You think and respond more quickly than most people can comprehend.

## Abilities

## Possible Game Settings
How to roll advantage Attributes. If using temporary or permanent value.
How to handle 1s in dice rolls. If an one (1) removes a success or not.


# Description of Sheets

## Mortal

## Werewolf

## Vampire

## Creature

## Spirit


# Description of Items

## Feature

## Melee Weapon

## Ranged Weapon

## Armor

## Power

### Gift

### Rite

### Discipline

### Charm

### Power

## Fetish

## Experience 


# Change Log

## Fix i 1.0.9
- Added Creature Sheet.
- Added auto-bonus to Attributes in Settings.
- Added max to Attributes in Settings.
- Added able to change Wound Penalties to Health Levels in Settings.
- Added to be albe to hide and show Abilities in Settings.
- New game setting theRollofOne - 1s doesn't remove success.
- Update macro Num RollDice. 
- Fixed problem with minimizing character sheets.
- Fixed width experience point description field.
- Fixed width gift name field.
- Fixed width weapon name field.
- Fixed pointer at Lock button.

## Fix i 1.0.8
- Added the rules regarding Rage and social rolls. If your rolling Rage is greater than your Rolling Willpower you get social penalties on all Charisma and Manipulation Rolls.
- Design Settings
- Show total attributes on Core
- Show rank name with Rank on Core
- New game setting advantageRolls - using permanent or temporary in rolls with advantage Attributes.
- Fixed Werewolf sheet height both app and web.
- Fixed order of attributes in Choose Attribute in Roll Ability
- Fixed so you can see Attribute speciallity when Roll Ability
- Cleaned Code rolling dice

## Fix i 1.0.7
- Added Version on Items
- Added Item Fetish
- Fix design Item Melee Weapons
- Fix design Item Ranged Weapons
- Fix design Item Armor
- Fix design Item Power
- Fix design Item Experience
- Fix design Item Feature
- Fix design Item Fetish
- Patch: Korrigerade Item Experience så visningstexten ligger i Description
- Göm Charm egenskaper som inte skall synas för spelare
- Göm Gift egenskaper som inte skall synas för spelare

## Fix i 1.0.6
- Lagt till så man kan se beskrivningen av en gift vid Active Gifts (Combat)
- Lagt till så man kan fylla i Conditions under Combat
- Funktionen av Conditions Ignore Pain och Frenzy
- Conditions syns i slaget
- BUGG: Kan inte skicka Charm till Chatt
- BUGG: + ramlat bort om Attribute och Ability finns vid Itemslag.

## Fix i 1.0.5
- Added migration
- Added worldVersion system setting
- Spirit sheet
- Lagt till Charms som Power
- Flytta ner tooltip ca 20 px så det ej kommer i vägen vid popout

## Fix i 1.0.4
- Fixat kan inte slå gift med bara Rage/Gnosis/Willpower

## Fix i 1.0.3
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

## Fix i 1.0.2
- Fixa spec Willpower
- Skicka System om Gift/Rituals vid slag
- Kan sätta gift som aktiv
- Active Gifts som är märkta som Combat syns i Combat-fliken
- Bredd på abilities-och attributesrubriker fixade under Core
- Bredd på weaponnamn fixade
- Bredd på health under Combat fixade
- Visa total exp kvar på Core
- Komprimerat Exp på Notes

## Fix i 1.0.1
- Döljer Edit/Delete-knappar om LOCKED.
- Översatt språk som glömts
- Visa totalt Earned Experience och Spent Experience
- Korrigera bredd på formulär och sätt max
- Hanterar bredd på Core och Shift
- Designa textarea (Bio och Gear)

## Fix i 1.0.0
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

## Fix i 0.3.8
- Töm Health Level högerklick
- Visa Attribute Total i settings
- Om ta bort fråga först
- Roll Damage
- Macro: Slå initiative
- Kunna modifiera initiativ bonus
- Soak beräknas baserat på form och typ av sheet
- Macro: Slå Soak
- Macro: Slå X st tärningar (t ex Willpower)

## Fix i v0.3.7
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

## Fix i v0.3.6
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

## Fix i v0.3.5
- Werewolf: Shiftknapparna shiftar som de ska
- Werewolf: Shiftfunktionen vet vilken form den har varit och vilken den skall till
- Garanterat att om inga former så sätts Homid
- Garanterat att beräkningar på formuläret för Werewolf också körs om Mortal körs
- Lagt till ShiftMod och ShiftDiff som beräknas vid öppnande av Werewolf beroende vilken form som valts
- Syns vad man valt för form
- Design Shapeshift
- Visa vilken form
- Snygga till var formikonen finns

## Fix i v0.3.4
- Lagt till mods och diffs på mortal för att hålla bonusar i slag
- Lagt till shiftmods och shiftdiffs på werewolf för att hålla bonusar vilken form de har
- Sorterat i GetData() för mortal och werewolf
- mortal öppnar mortal-sheet
- werewolf-actor-sheet.js har get template
- werewolf öppnar werewolf-sheet
- Shapeshift har egen html-fil
- Ersatt {{equalValue}} med {{iff}}
- Städat i console.log vid öppnande av sheet så det skrivs ut i rätt ordning

## Fix i v0.3.3
- Design Armor
- Armor Drag
- Armor skapa
- Armor Ta Bort

## Fix i v0.3.2
- Ranged Weapons skapa
- Ranged Weapons Drag
- Ranged Weapons alla Attribute
- Ranged Weapons ta bort
- Design Ranged Weapon
- Sätta Health Levels /, x, *
- Health Level hantering
- Välja health även om låst

## Fix i v0.3.1
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

## Fix i v0.3
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

## Fix i v0.2
- Design slå tärningar från formulär titta på marcro för ideer särskilt med färgschema beroende på vad för slags varelse som slår. Vampire finns, kvar, werewolf och mortal. Från CoD?
- Speciality dubblar inte success 10.
- Kan inte slå Skill + Attribute, detta blir Skill + Skill.
- Kan inte slå Attribute enbart
- Slå t ex willpower funkar inte
- Fel när öppnar werewolf sheet. (fick skapa en ny)
- Bytt namn på attribute.label
- Slår grundegenskap alltid en tärning
- Kan inte uppgradera systemet. (world.json)