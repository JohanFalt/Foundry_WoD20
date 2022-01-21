# Foundry_WoD20
 
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

Fix i v0.3.2
- Ranged Weapons skapa
- Ranged Weapons Drag
- Ranged Weapons alla Attribute
- Ranged Weapons ta bort
- Design Ranged Weapon
- Sätta Health Levels /, x, *
- Health Level hantering
- Välja health även om låst

Fix i v0.3.3
- Design Armor
- Armor Drag
- Armor skapa
- Armor Ta Bort

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