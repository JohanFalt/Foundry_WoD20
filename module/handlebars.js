import BonusHelper from "./scripts/bonus-helpers.js";
import ItemHelper from "./scripts/item-helpers.js";
import Functions from "./functions.js";

/**
 * Registers all Handlebars helpers used throughout the system.
 * This function registers over 50 Handlebars helpers for various template operations.
 */
export const registerHandlebarsHelpers = function () {
		
	Handlebars.registerHelper("add", function (num1, num2) {
		return parseInt(num1) + parseInt(num2);
	});

	Handlebars.registerHelper("subtract", function (num1, num2) {
		return parseInt(num1) - parseInt(num2);
	});

	Handlebars.registerHelper("concat", function (...args) {
		// Remove the last argument (options object) if present
		const strings = args.filter(arg => typeof arg === 'string');
		return strings.join('');
	});

	Handlebars.registerHelper("numLoop", function (num, options) {
		let ret = "";

		for (let i = 0, j = num; i < j; i++) {
			ret = ret + options.fn(i);
		}

		return ret;
	});

	Handlebars.registerHelper("numFromLoop", function (from, num, options) {
		let ret = "";

		for (let i = from; i <= num; i++) {
			ret = ret + options.fn(i);
		}

		return ret;
	});

	Handlebars.registerHelper("numDownToLoop", function (from, num, options) {
		let ret = "";

		for (let i = from; i >= num; i--) {
			ret = ret + options.fn(i);
		}

		return ret;
	});

	// Handlebars.registerHelper("iff", function (a, operator, b, opts) {
	// 	var bool = false;
	// 	switch (operator) {
	// 		case "==":
	// 			bool = a == b;
	// 			break;
	// 		case ">":
	// 			bool = a > b;
	// 			break;
	// 		case "<":
	// 			bool = a < b;
	// 			break;
	// 		case ">=":
	// 			bool = parseInt(a) >= parseInt(b);
	// 			break;
	// 		case "<=":
	// 			bool = a <= b;
	// 			break;
	// 		case "!=":
	// 			bool = a != b;
	// 			break;
	// 		case "contains":
	// 			if (a && b) {
	// 				bool = a.includes(b);
	// 			} else {
	// 				bool = false;
	// 			}
	// 			break;
	// 		default:
	// 		throw "Unknown operator " + operator;
	// 	}

	// 	if (bool) {
	// 		return opts.fn(this);
	// 	} else {
	// 		return opts.inverse(this);
	// 	}
	// });

	Handlebars.registerHelper('eqAny', function () {
		for(let i = 1; i < arguments.length; i++) {
		  	if(arguments[0] === arguments[i]) {
				return true;
		  	}
		}
		return false;
	});

	Handlebars.registerHelper('neAny', function () {
		for(let i = 1; i < arguments.length; i++) {
		  	if(arguments[0] === arguments[i]) {
				return false;
		  	}
		}
		return true;
	});

	Handlebars.registerHelper('eqAnyNot', function () {
		let found = false;

		for(let i = 1; i < arguments.length; i++) {
		  	if(arguments[0] === arguments[i]) {
				found = true;
		  	}
		}
		
		return !found;
	});

	Handlebars.registerHelper('le', function( a, b ){
		var next =  arguments[arguments.length-1];
		return (a <= b) ? next.fn(this) : next.inverse(this);
	});

	Handlebars.registerHelper("shorten", function (text, i) {
		if (text == undefined) {
			return "";
		}

		let result = text;

		if (text.length > i) {
			if (text.length > i + 3) {
				result = text.substring(0, i) + "...";
			}
		}

		return result;
	});

	Handlebars.registerHelper('SvgHtml', (icon, dice, sheettype, options) => {
		let value = dice.value;
		let color = dice.color;

		if ((options != "") && (options != undefined)) {
			sheettype = options;
		}

		if (value == 10) {
			value = 0;
		}

		if (sheettype === undefined) {
			sheettype = "mortal";
		}
		if (sheettype === "Changing Breed") {
			sheettype = "werewolf";
		}

		// Map color prefixes to correct sheettype for icon lookup
		if (color === "brown_") {
			sheettype = "werewolf";
		}
		else if (color === "blue_") {
			// blue_ can be changeling or mortal, use sheettype if available
			if (sheettype !== "changeling" && sheettype !== "mortal") {
				sheettype = "changeling"; // default to changeling for blue_
			}
		}
		else if (color === "purple_") {
			sheettype = "mage";
		}
		else if (color === "red_") {
			sheettype = "vampire";
		}
		else if (color === "death_") {
			sheettype = "wraith";
		}
		else if (color === "orange_") {
			sheettype = "hunter"; // hunter and demon use same icons
		}
		else if (color === "yellow_") {
			sheettype = "mummy";
		}

		if (color == "black_") {
			return encodeURIComponent(game.worldofdarkness.icons["black"][icon+value]);
		}
		else {
			return encodeURIComponent(game.worldofdarkness.icons[sheettype.toLowerCase()][icon+value]);
		}		
	});

	/**
	 * Returns the remainder after dividing value by mod.
	 * Useful for creating repeating patterns in loops (e.g., every nth item).
	 * @param {number} value - The number to divide
	 * @param {number} mod - The divisor
	 * @return {number} - The remainder (value % mod)
	 */
	Handlebars.registerHelper("mod", function (value, mod) {
		return value % mod;
	});

	Handlebars.registerHelper("getEra", function (actor) {
		let era = actor.system.settings.era;

		if (era ==  CONFIG.worldofdarkness.era.modern) {
			return "modern";
		}
		else if (era ==  CONFIG.worldofdarkness.era.victorian) {
			return "victorian";
		}
		else if (era ==  CONFIG.worldofdarkness.era.darkages) {
			return "darkages";
		}

		return "modern";
	});

	Handlebars.registerHelper("getVariant", function (actor) {
		let variant = actor.system.settings.variant;

		if ((actor.type != CONFIG.worldofdarkness.sheettype.mortal) && (actor.type != CONFIG.worldofdarkness.sheettype.changingbreed) && (actor.type != CONFIG.worldofdarkness.sheettype.changeling) && (actor.type != CONFIG.worldofdarkness.sheettype.creature)) {
			return "variantSelected";
		}
		else if (variant == undefined) {
			return "variantUnselected";
		}
		else if (variant == "") {
			return "variantUnselected";
		}
		else {
			return "variantSelected";
		}
	});	

	Handlebars.registerHelper("getVariantName", function (type, variant) {
		return CONFIG.worldofdarkness.variant[type][variant];
	});

	Handlebars.registerHelper("getBonusName", function (type) {
		return game.i18n.localize(CONFIG.worldofdarkness.bonus[type]);
	});	

	Handlebars.registerHelper("lookupListData", function (listData, listname, value) {
		if (value === "") {
			return value;
		}

		// const list = listData[listname]
		// 				.filter(item => item.value === value);
		// return game.i18n.localize(list.label);

		return game.i18n.localize(listData[listname]?.find(i => i.value === value)?.label ?? ""
	);
	});	

	/* get advantages box mainly used on Core (application v1) */
	Handlebars.registerHelper("getGetStatArea", function (actor, stat, statname, isrollable, ispermanent, istemporary, showbanner = true) {
		let html = "";
		let permanent_html = "";
		let temporary_html = "";
		let stat_headline_text = game.i18n.localize(`wod.advantages.${statname}`);
		let rollable = "";
		let splat = CONFIG.worldofdarkness.sheettype.mortal;
		let splat_temporary = CONFIG.worldofdarkness.sheettype.mortal;
		let path = "advantages";

		if (isrollable) {
			rollable = " vrollable";
		}

		// vampire path
		if (statname == "path") {
			if (stat.label == "custom") {
				stat_headline_text = stat.custom;
			}
			else {
				stat_headline_text = game.i18n.localize(stat.label);
			}
		}

		// wraith corpus
		if (statname == "corpus") {
			splat_temporary = CONFIG.worldofdarkness.sheettype.wraith;
		}

		// wereweolf and shifter renown
		if ((statname == "glory") || (statname == "honor") || (statname == "wisdom")) {
			path = "renown";

			splat = CONFIG.worldofdarkness.sheettype.werewolf;
			if (actor.type == CONFIG.worldofdarkness.sheettype.werewolf) {
				stat_headline_text = game.i18n.localize(actor.GetShifterRenownName(actor.system.tribe, statname));
			}
			else {
				stat_headline_text = game.i18n.localize(actor.GetShifterRenownName(actor.system.changingbreed, statname));
			}
		}		

		if (showbanner) {
			html += `<div class="sheet-headline sheet-banner-small splatFont ${rollable}" data-type="${splat}" data-key="${statname}" data-noability="true"><span class="sheet-banner-text">${stat_headline_text}</span></div>`;	
		}
		else {
			html += `<div class="sheet-headline splatFont ${rollable}" data-type="${splat}" data-key="${statname}" data-noability="true"><span class="sheet-banner-text">${stat_headline_text}</span></div>`;
		}
		

		if (ispermanent) {
			let header = `<div class="sheet-boxcontainer ${statname}"><div class="resource-value permValueRow" data-value="${stat.permanent}" data-name="${path}.${statname}.permanent">`;
			let footer = `</div></div>`;

			for (let value = 0; value <= stat.max - 1; value++) {
				if ((actor.type == CONFIG.worldofdarkness.sheettype.changeling) && (statname == "willpower")) {
					let imbalance = "";
					let imbalance_title_text = "";

					let imbalanceValue = stat.permanent - stat.imbalance;

					if ((value >= imbalanceValue) && (value < stat.permanent)) {
						imbalance = `imbalance`;
						imbalance_title_text = game.i18n.localize(`wod.advantages.imbalance`);
					}

					permanent_html += `<span class="resource-value-step ${imbalance}" title="${imbalance_title_text}" data-type="${splat}" data-key="${statname}" data-index="${value}"></span>`;
				}
				else {
					permanent_html += `<span class="resource-value-step" data-type="${splat}" data-key="${statname}" data-index="${value}"></span>`;
				}
			}
					
			permanent_html = header + permanent_html + footer;
		}		

		if (istemporary) {
			let header = `<div class="sheet-boxcontainer"><div class="resource-counter tempSquareRow" data-value="${stat.temporary}" data-name="${path}.${statname}.temporary">`;
			let footer = `</div></div>`;

			for (let value = 0; value <= stat.max - 1; value++) {				
				let mark = "";

				if ((splat_temporary === CONFIG.worldofdarkness.sheettype.wraith) && (stat.label === "wod.advantages.corpus")) {
					if (stat.temporary > value) {
						mark = "/";
					}

					if (actor.system?.listdata?.health[value] !== undefined) {
						mark = actor.system.listdata.health[value].status;
					}					
				}
				else {
					if (stat.temporary > value) {
						mark = "x";
					}
				}				

				temporary_html += `<span class="resource-value-step" data-type="${splat_temporary}" data-key="${statname}" data-index="${value}" data-state="${mark}"></span>`;
			}			

			temporary_html = header + temporary_html + footer;
		}
		
		html += permanent_html + temporary_html;

		return html;
	});

	/* get advantages box mainly used on Core (application v2) */
	Handlebars.registerHelper("getGetStatArea_v2", function (actor, stat, showbanner = true) {

		const statname = stat.system.label;
		const statid = stat.system.id;
		const isrollable = stat.system.settings.useroll;
		const ispermanent = stat.system.settings.usepermanent;
		const istemporary = stat.system.settings.usetemporary;

		let html = "";
		let permanent_html = "";
		let temporary_html = "";
		//let stat_headline_text = game.i18n.localize(`wod.advantages.${statname}`);
		let stat_headline_text = game.i18n.localize(statname);
		let rollable = "";
		let rollaction = "";
		let splat = CONFIG.worldofdarkness.sheettype.mortal;	
		let splat_temporary = CONFIG.worldofdarkness.sheettype.mortal;	

		if (isrollable) {
			rollable = " vrollable";
			rollaction = `data-action="rollDice"`;
		}

		// wraith corpus
		if (statid == "corpus") {
			splat_temporary = CONFIG.worldofdarkness.sheettype.wraith;
		}

		// wereweolf and shifter renown
		if ((statid == "glory") || (statid == "honor") || (statid == "wisdom")) {
			splat = CONFIG.worldofdarkness.sheettype.werewolf;
			if (actor.type == "PC") {
				stat_headline_text = game.i18n.localize(actor.GetShifterRenownName(actor.system.bio.splatfields.tribe.value, statid));
			}
			else if (actor.type == CONFIG.worldofdarkness.sheettype.werewolf) {
				stat_headline_text = game.i18n.localize(actor.GetShifterRenownName(actor.system.tribe, statid));
			}
			else {
				stat_headline_text = game.i18n.localize(actor.GetShifterRenownName(actor.system.changingbreed, statid));
			}
		}		

		if (showbanner) {
			html += `<div class="sheet-headline sheet-banner-small splatFont ${rollable}" data-type="${splat}" data-key="${statid}" data-noability="true" ${rollaction}><span class="sheet-banner-text">${stat_headline_text}</span></div>`;	
		}
		else {
			html += `<div class="sheet-headline splatFont ${rollable}" data-type="${splat}" data-key="${statname}" data-noability="true" ${rollaction}><span class="sheet-banner-text">${stat_headline_text}</span></div>`;
		}		

		if (ispermanent) {
			let header = `<div class="sheet-boxcontainer ${statid}"><div class="resource-value permValueRow" data-itemid="${stat._id}" data-key="${statid}" data-value="${stat.system.permanent}" data-name="system.permanent">`;
			let footer = `</div></div>`;

			for (let value = 0; value <= stat.system.max - 1; value++) {
				if ((actor.system.settings.splat == CONFIG.worldofdarkness.splat.changeling) && (statname == "willpower")) {
					let imbalance = "";
					let imbalance_title_text = "";

					let imbalanceValue = stat.system.permanent - stat.system.imbalance;

					if ((value >= imbalanceValue) && (value < stat.system.permanent)) {
						imbalance = `imbalance`;
						imbalance_title_text = game.i18n.localize(`wod.advantages.imbalance`);
					}

					permanent_html += `<span class="resource-value-step ${imbalance}" title="${imbalance_title_text}" data-action="editDot" data-type="${splat}" data-index="${value}"></span>`;
				}
				else {
					permanent_html += `<span class="resource-value-step" data-action="editDot" data-type="${splat}" data-index="${value}"></span>`;
				}
			}
					
			permanent_html = header + permanent_html + footer;
		}		

		if (istemporary) {
			let header = `<div class="sheet-boxcontainer"><div class="resource-counter tempSquareRow" data-itemid="${stat._id}" data-key="${statid}" data-value="${stat.system.temporary}" data-name="system.temporary">`;
			let footer = `</div></div>`;

			for (let value = 0; value <= stat.system.max - 1; value++) {
				let mark = "";

				if (stat.system.temporary > value) {
					mark = "x";
				}

				temporary_html += `<span class="resource-value-step" data-action="editDot" data-type="${splat_temporary}" data-index="${value}" data-state="${mark}"></span>`;
			}			

			temporary_html = header + temporary_html + footer;
		}
		
		html += permanent_html + temporary_html;

		return html;
	});

	Handlebars.registerHelper("getMainPowerList", function (actor, powertype) {
		const items = (actor?.items || []).filter(item => item.type === "Power" && item.system.type === powertype);
		items.sort((a, b) => a.name.localeCompare(b.name));
		
		return items;
	});

	Handlebars.registerHelper("getUnsortedMainPowerList", function (actor, powertype) {
		const items = (actor?.items || []).filter(item => item.type === "Power" && item.system.type === powertype && item?.system?.parentid === "");
		items.sort((a, b) => a.name.localeCompare(b.name));
		
		return items;
	});

	Handlebars.registerHelper("couintUnsortedMainPowerList", function (actor, powertype) {
		const items = (actor?.items || []).filter(item => item.type === "Power" && item.system.type === powertype && item?.system?.parentid === "");
		items.sort((a, b) => a.name.localeCompare(b.name));
		
		return items.length;
	});

	Handlebars.registerHelper("getPowerList", function (actor, mainpowerId) {
		const items = (actor?.items || []).filter(item => item.type === "Power" && item.system.parentid === mainpowerId);
		items.sort((a, b) => {
			const levelComparison = a.system.level - b.system.level;
			if (levelComparison !== 0) return levelComparison;
			return a.name.localeCompare(b.name);
		});
		
		return items;
	});

	/**
	 * Get a power list with main power and then connected sub powers to that one. E.g disciplines
	 * @deprecated Legacy Actor only - Used only by legacy actor sheets (Mortal, Vampire, Werewolf, Mage, etc.)
	 */	
	Handlebars.registerHelper("getGetPowerList", function (locked, actor, powername, powertype, bannertext, useabilitiy) {
		let html = "";
		let addText = game.i18n.localize("wod.labels.add." + powername);
		let sendText = game.i18n.localize("wod.labels.send");
		let removebonusText = game.i18n.localize("wod.labels.power.removebonus." + powername);
		let editText = game.i18n.localize("wod.labels.edit." + powername);
		let deleteText = game.i18n.localize("wod.labels.remove." + powername);

		let addsubpowertext = game.i18n.localize("wod.labels.add." + powername + "power");

		html = 
			`<div class="sheet-headline sheet-banner splatFont" data-area="${powername}">
				<span class="sheet-banner-text">${bannertext}</span>
			</div>`;

		const items = actor.items.filter(item => item.type === "Power" && item.system.type === powertype);

		items.sort((a, b) => a.name.localeCompare(b.name));

		for (const i in items) {
			let headerhtml = `<div class="item-row-area mainpower-row"><div class="clearareaBox power-row">`;
			let footerhtml = `</div></div>`;

			let descriptionhtml = "";
			
			if (items[i].system.description != "") {
				descriptionhtml = `<h3>${game.i18n.localize("wod.labels.description")}</h3> ${items[i].system.description}`;
			}

			let detailshtml = "";

			if (items[i].system.details != "") {
				detailshtml = `<h3>${game.i18n.localize("wod.labels.power.system")}</h3> ${items[i].system.details}`;
			}

			let listhtml = `<div class="pullLeft ${powername}-headline splatFont headlineGroup">${items[i].name}</div>`;					

			listhtml += `<div class="resource-value pullLeft power-dotBox" data-value="${items[i].system.value}" data-itemid="${items[i]._id}">`;

			for(let num = 0; num <= items[i].system.max - 1; num++) {
				let supernatural = "";

				if (items[i].system.max > 5) {
					supernatural = "supernaturalAttribute";
				}			

				listhtml += `<span class="${supernatural} resource-value-step" data-type="${CONFIG.worldofdarkness.sheettype.mortal}" data-index="${num}" style="margin-right: 5px;"></span>`;
			}

        	listhtml += `</div>`;	

			listhtml += `<div class="pullLeft power-iconbox">`;				// ----- POWERICONS START
				
			if ((descriptionhtml != "") || (detailshtml != "")) {
				let description = descriptionhtml + detailshtml;

				listhtml += `
					<div class="pullLeft pointer headlineNormal tooltip">
						<i class="icon fa-solid fa-memo"></i>
						<span class="tooltiptext">${description}</span>
					</div>`;
			}

			listhtml += `<div class="pullLeft pointer"><a class="send-chat" title="${sendText}" data-itemid="${items[i]._id}"><i class="icon fa-solid fa-comment-dots"></i></a></div>`;                        

			if (!locked) {
				listhtml += `
					<div class="pullLeft pointer">
						<a class="clearPower" title="${removebonusText}" data-powertype="main" data-item-id="${items[i]._id}"><i class="icon fa-solid fa-lock"></i></a>
					</div>
					<div class="pullLeft pointer">
						<a class="item-edit" title="${editText}" data-type="Power" data-item-id="${items[i]._id}"><i class="icon fa-solid fa-pen-to-square"></i></a>
					</div>
					<div class="pullLeft pointer">
						<a class="item-delete" title="${deleteText}" data-type="Power" data-item-id="${items[i]._id}"><i class="icon fa-solid fa-trash-can"></i></a>
					</div>`; 
			}

			listhtml += `</div>`;											// ----- POWERICONS END

			html += headerhtml + listhtml + footerhtml;

			let itempowers = actor.items.filter(item => item.type === "Power" && item.system.parentid === items[i]._id);
			itempowers = itempowers.sort((a, b) => {
				return a.system.level.toString().localeCompare(b.system.level.toString()) || a.name.localeCompare(b.name);
			});

			for (const p in itempowers) {
				removebonusText = game.i18n.localize("wod.labels.power.clear" + powername);
				editText = game.i18n.localize("wod.labels.edit." + powername + "power");
				deleteText = game.i18n.localize("wod.labels.remove." + powername + "power");
				let showbonusText = game.i18n.localize("wod.labels.show.bonus");

				let rollabelcss = `${powername}power-nonerollablerow`;
				let isactive = "";

				if (itempowers[p].system.isrollable) {
					rollabelcss = `${powername}power-rollablerow`;
				}

				headerhtml = `<div class="item-row-area">`;		
				footerhtml = `</div>`;

				descriptionhtml = "";
				
				if (itempowers[p].system.description != "") {
					descriptionhtml = `<h3>${game.i18n.localize("wod.labels.description")}</h3> ${itempowers[p].system.description}`;
				}

				detailshtml = "";

				if (itempowers[p].system.details != "") {
					detailshtml = `<h3>${game.i18n.localize("wod.labels.power.system")}</h3> ${itempowers[p].system.details}`;
				}

				listhtml = `<div class="clearareaBox ${powername}power-row ${rollabelcss}">`; 		// ----- ROW START

				if (itempowers[p].system.isrollable) {
					rollabelcss = `vrollable`;
				}
				if (itempowers[p].system.isactive) {
					isactive = `checked`;
				}

				listhtml += `<div class="pullLeft item-activeBox"><input class="item-active pointer" name="power.system.isactive" type="checkbox" data-item-id="${itempowers[p]._id}" data-type="isactive" ${isactive}></input></div>`;
				listhtml += `<div class="pullLeft ${powername}-headline headlineNormal ${rollabelcss}" data-type="${CONFIG.worldofdarkness.sheettype.mortal}" data-object="${powername}" data-rollitem="true" data-itemid="${itempowers[p]._id}">${itempowers[p].name}</div>`;

				if (itempowers[p].system.isrollable) {
					let dice1name = game.i18n.localize(getAttributes(itempowers[p].system.dice1));
					dice1name = game.i18n.localize(getAbility(actor, itempowers[p].system.dice1));					

					let difficultyText = itempowers[p].system.difficulty;

					if (itempowers[p].system.dice1 == "path") {
						dice1name = actor.system.advantages.path.label;
					}
					if (itempowers[p].system.dice1 == "custom") {
						if (itempowers[p].system.secondaryabilityid != "") {
							const item = actor.getEmbeddedDocument("Item", itempowers[p].system.secondaryabilityid);
							if (item == undefined) {
								console.warn("Secondary ability for power " + itempowers[p].name + " not found.");
								dice1name = game.i18n.localize("wod.dialog.power.secondarynotselected");
							}
							else {
								dice1name = item.system.label;
							}							
						}
						else {
							dice1name = game.i18n.localize("wod.dialog.power.secondarynotselected");
						}						
					}

					if (useabilitiy) {
						// TODO
					}

					if (parseInt(itempowers[p].system.difficulty) == -1) {
						difficultyText = game.i18n.localize("wod.labels.varies");
					}

					listhtml += `
						<div class="pullLeft power-dicebox headlineNormal">${dice1name}</div>
						<div class="pullLeft power-valueBox headlineNormal centerText">${difficultyText}</div>`;
				}

				listhtml += `<div class="pullLeft power-iconbox">`;				// ----- POWERICONS START
				
				if ((descriptionhtml != "") || (detailshtml != "")) {
					let description = descriptionhtml + detailshtml;

					listhtml += `
						<div class="pullLeft pointer headlineNormal tooltip">
							<i class="icon fa-solid fa-memo"></i>
							<span class="tooltiptext">${description}</span>
						</div>`;
				}

				listhtml += `<div class="pullLeft pointer"><a class="send-chat" title="${sendText}" data-itemid="${itempowers[p]._id}"><i class="icon fa-solid fa-comment-dots"></i></a></div>`;                        

				if (!locked) {
					listhtml += `
						<div class="pullLeft pointer">
							<a class="clearPower" title="${removebonusText}" data-powertype="power" data-item-id="${itempowers[p]._id}"><i class="icon fa-solid fa-lock"></i></a>
						</div>
						<div class="pullLeft pointer">
							<a class="item-edit" title="${editText}" data-type="Power" data-item-id="${itempowers[p]._id}"><i class="icon fa-solid fa-pen-to-square"></i></a>
						</div>
						<div class="pullLeft pointer">
							<a class="item-delete" title="${deleteText}" data-type="Power" data-item-id="${itempowers[p]._id}"><i class="icon fa-solid fa-trash-can"></i></a>
						</div>`; 
				}

				if (itempowers[p].system.bonuslist.length > 0) {
					let id = `collapsiblehekaubonus${p}`;
					let typeid = `${powername}${p}`;
	
					listhtml += `
						<div class="pullLeft pointer">
							<i id="${id}" class="icon collapsible button fa-solid fa-angles-right" title="${showbonusText}" data-sheet="${CONFIG.worldofdarkness.sheettype.mortal}" data-type="${typeid}"></i>
						</div>`; 
				}

				listhtml += `</div>`;											// ----- POWERICONS END

				listhtml += `</div>`;											// ----- ROW END

				listhtml += `<div class="hide bonuses ${powername}${p}" data-area="${powername}bonus${p}">`;		// ----- BONUS START

				for (const b in itempowers[p].system.bonuslist) {
					listhtml += `<div class="clearareaBox">
									<div class="pullLeft bonus-power-name headlineNormal">${itempowers[p].system.bonuslist[b].name}</div>
									<div class="pullLeft headlineNormal" style="width: 200px;">${game.i18n.localize(CONFIG.worldofdarkness.bonus[itempowers[p].system.bonuslist[b].type])}</div>
									<div class="pullLeft headlineNormal">${itempowers[p].system.bonuslist[b].value}</div>
								</div>`;
				}

				listhtml += `</div>`;																				// ----- BONUS END

				html += headerhtml + listhtml + footerhtml;
			}
		}

		return html;
	});

	/* exalted */
	/**
	 * @deprecated Legacy Actor only - Used only by legacy Exalted actor sheets
	 */
	Handlebars.registerHelper("getExaltedCharmTypes", function (actor, categoryname, powertype) {
		const items = (actor?.items || []).filter(item => item.type === "Power" && item.system.type === powertype);

		if (Array.isArray(items)) {
			const uniqueVariants = [
				...new Set(
				items
					.map(item => {
						return item.system?.[categoryname] !== undefined ? item.system[categoryname] : null;
					})
					.filter(value => value !== null) // Ta bort null-värden som inte finns
				)
			];

			return uniqueVariants;
		}
	});

	/**
	 * @deprecated Legacy Actor only - Used only by legacy Exalted actor sheets
	 */
	Handlebars.registerHelper("getExaltedCharm", function (actor, categoryname, unique) {
		let charms = [];
		charms = actor?.items.filter(item => item.system?.[categoryname] === unique);

		return charms;		
	});

	/* Get the tooltip graphics */
	/**
	 * @deprecated Legacy Actor only - Used only by legacy actor sheets. PC Actor uses getToolTip_v2 instead.
	 */
	Handlebars.registerHelper("getToolTip", function (description, detail, bonuses, actor) {
		let listhtml = "";
		let descriptionhtml = "";
				
		if (description != "") {
			descriptionhtml = `<h3>${game.i18n.localize("wod.labels.description")}</h3> ${description}`;
		}

		let detailshtml = "";

		if ((detail != "") || (bonuses != undefined)) {
			detailshtml = `<h3>${game.i18n.localize("wod.labels.power.system")}</h3> ${detail}`;

			if ((bonuses != undefined) && (bonuses.length > 0)) {
				detailshtml += "<table><tr><td>"+game.i18n.localize("wod.labels.type")+"</td><td>"+game.i18n.localize("wod.effects.area")+"</td><td>"+game.i18n.localize("wod.labels.modifier")+"</td><tr>";
				for (const bonus of bonuses) {
					detailshtml += "<tr><td>" + game.i18n.localize(CONFIG.worldofdarkness.bonus[bonus.type]) + "</td><td>" + game.i18n.localize(getAbility(actor, game.i18n.localize(getAttributes(bonus.settingtype)))) + "</td><td>" + bonus.value + "</td></tr>";
				}
				detailshtml += "</table>";
			}			
		}

		if ((descriptionhtml != "") || (detailshtml != "")) {
			let description = descriptionhtml + detailshtml;

			listhtml = `
				<div class="pointer tooltip">
					<i class="icon fa-solid fa-memo"></i>
					<span class="tooltiptext">${description}</span>
				</div>`;
		}

		return listhtml;
	});

	Handlebars.registerHelper("showToolTip", function (item) {
		let description = item?.system?.description;

		if (description === undefined) {
			description = "";
		}
		else {
			description = description.trim();
		}

		let details = item?.system?.details;

		if (details === undefined) {
			details = "";
		}
		else {
			details = details.trim();
		}		

		if(item?.type === "Rote") return true;
		if (item?.system?.bonuslist?.length > 0) return true;
		if (description !== "") return true;
		if (details !== "") return true;	

		return false;
	});

	Handlebars.registerHelper("getToolTip_v2", function (description, detail, bonuses, actor, item) {
		let descriptionhtml = "";
				
		if (description != "") {
			descriptionhtml = `<div class="headlineList">${game.i18n.localize("wod.labels.description")}</div><div class="tooltipText">${description}</div>`;
		}

		let detailshtml = "";

		if ((detail !== "") || (bonuses?.length > 0)) {
			detailshtml = `<div class="headlineList">${game.i18n.localize("wod.labels.power.system")}</div><div class="tooltipText">${detail}</div>`;

			if (bonuses?.length > 0) {
				detailshtml += `<div class="headlineRow description-itemlist">
									<div class="width-namebox">${game.i18n.localize("wod.labels.type")}</div>
									<div class="width-namebox">${game.i18n.localize("wod.effects.area")}</div>
									<div class="width-valuebox">${game.i18n.localize("wod.labels.modifier")}</div>
								</div>`;
				for (const bonus of bonuses) {
					detailshtml += `<div class="item-row-area description-itemlist">
										<div class="width-namebox tooltipText">${game.i18n.localize(CONFIG.worldofdarkness.bonus[bonus.type])}</div>
										<div class="width-namebox tooltipText">${game.i18n.localize(getAbility(actor, game.i18n.localize(getAttributes(bonus.settingtype))))}</div>
										<div class="width-valuebox tooltipText">${bonus.value}</div>
									</div>`;
				}
			}			
		}

		if ((item?.type === "Rote") && (actor?.type === "PC")) {
			let spheredescription = "";
			
			if (item.system.correspondence > 0) {
				const sphere = actor.items.filter(item => item.type === "Sphere" && item.system.id === "correspondence")[0];

				if (sphere) {
					spheredescription += `<div>${game.i18n.localize(sphere.system.label)} (${item.system.correspondence})</div>`;
				}				
			}
			if (item.system.entropy > 0) {
				const sphere = actor.items.filter(item => item.type === "Sphere" && item.system.id === "entropy")[0];

				if (sphere) {
					spheredescription += `<div>${game.i18n.localize(sphere.system.label)} (${item.system.entropy})</div>`;
				}
			}
			if (item.system.forces > 0) {		
				const sphere = actor.items.filter(item => item.type === "Sphere" && item.system.id === "forces")[0];

				if (sphere) {
					spheredescription += `<div>${game.i18n.localize(sphere.system.label)} (${item.system.forces})</div>`;
				}
			}
			if (item.system.life > 0) {
				const sphere = actor.items.filter(item => item.type === "Sphere" && item.system.id === "life")[0];

				if (sphere) {
					spheredescription += `<div>${game.i18n.localize(sphere.system.label)} (${item.system.life})</div>`;
				}
			}
			if (item.system.matter > 0) {
				const sphere = actor.items.filter(item => item.type === "Sphere" && item.system.id === "matter")[0];

				if (sphere) {
					spheredescription += `<div>${game.i18n.localize(sphere.system.label)} (${item.system.matter})</div>`;
				}
			}
			if (item.system.mind > 0) {
				const sphere = actor.items.filter(item => item.type === "Sphere" && item.system.id === "mind")[0];
				
				if (sphere) {
					spheredescription += `<div>${game.i18n.localize(sphere.system.label)} (${item.system.mind})</div>`;
				}
			}
			if (item.system.prime > 0) {
				const sphere = actor.items.filter(item => item.type === "Sphere" && item.system.id === "prime")[0];

				if (sphere) {
					spheredescription += `<div>${game.i18n.localize(sphere.system.label)} (${item.system.prime})</div>`;
				}
			}
			if (item.system.spirit > 0) {
				const sphere = actor.items.filter(item => item.type === "Sphere" && item.system.id === "spirit")[0];

				if (sphere) {
					spheredescription += `<div>${game.i18n.localize(sphere.system.label)} (${item.system.spirit})</div>`;
				}
			}
			if (item.system.time > 0) {
				const sphere = actor.items.filter(item => item.type === "Sphere" && item.system.id === "time")[0];

				if (sphere) {
					spheredescription += `<div>${game.i18n.localize(sphere.system.label)} (${item.system.time})</div>`;
				}
			}

			descriptionhtml += spheredescription;
		}

		return descriptionhtml + detailshtml;
	});

	Handlebars.registerHelper("getConnectedItemList", function (actor, type, variant, parentid) {
		let list = [];
		let items = (actor.items.filter(i => i.type === type && i.system.type === variant && i.system.parentid === parentid));

		if (items != undefined) {
			return items;
		}

		return list;
	});

	/* TRUE / FALSE if a list is empty */
	Handlebars.registerHelper("listNotEmpty", function (list) {
		return list.length > 0;
	});

	Handlebars.registerHelper("getAttributes", function (attribute) {
		return getAttributes(attribute);
	});

	Handlebars.registerHelper("getSecondaryAbility", function (ability, actor, id) {
		let abilityName = game.i18n.localize("wod.labels.power.noabilityselected");

		if ((ability == "custom") && (id != "") ) {
			const item = actor.getEmbeddedDocument("Item", id);

			if (item !== undefined) {
				abilityName = item.system.label;
			}
		}

		return abilityName;
	});

	/* get all bonuses */
	Handlebars.registerHelper("getBonuses", function (actor, type, sort) {
		let bonuslist = [];

		if (type != "") {
			return BonusHelper.GetAllAttributeBonus(actor, bonuslist, type);
		}

		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_diff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_dice_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_auto_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attribute_fixed_value");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "ability_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "ability_diff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "soak_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "soak_diff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "health_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "initiative_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "movement_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attack_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "attack_diff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "frenzy_buff");
		bonuslist = BonusHelper.GetAllAttributeBonus(actor, bonuslist, "frenzy_diff");
		
		return bonuslist;
	});

	Handlebars.registerHelper("getItems", function (actor) {
		return ItemHelper.GetAllItems(actor);
	});

	Handlebars.registerHelper("getItemType", function (actor, itemtype, itemcategory) {
		return ItemHelper.GetItemType(actor, itemtype, itemcategory);
	});

	Handlebars.registerHelper("getNotes", function (actor, type, category) {
		if (type == "" || type == undefined || typeof type === "object") {
			return ItemHelper.GetAllNotes(actor);
		}
		else {
			return ItemHelper.GetItemType(actor, type, category);
		}		
	});

	Handlebars.registerHelper("getEarnedExperience", function (actor) {
		return ItemHelper.GetEarnedExperience(actor);
	});

	Handlebars.registerHelper("getSpendExperience", function (actor) {
		return ItemHelper.GetSpendExperience(actor);
	});

	Handlebars.registerHelper("getTotalExperience", function (actor, type) {
		const earnedExp = ItemHelper.GetEarnedExperience(actor);
		const spendExp = ItemHelper.GetSpendExperience(actor);		

		if (type == "total") {
			let earned = 0;
			let spent = 0;
			earnedExp.forEach(item => 
				earned += parseInt(item.system.amount));
			spendExp.forEach((item) => {
				if (item.system.isspent) {
					spent += parseInt(item.system.amount);
				}
			});

			return earned - spent;
		}
		if (type == "earned") {
			let earned = 0;
			earnedExp.forEach(item => earned += parseInt(item.system.amount));
			return earned;
		}
		if (type == "spent") {
			let spent = 0;
			spendExp.forEach((item) => {
				if (item.system.isspent) {
					spent += parseInt(item.system.amount);
				}
			});
			return spent;
			
		}
	});

	Handlebars.registerHelper("getAbility", function (ability, actor) {	
		
		if (ability == "") {
			return "";
		}

		if (actor != undefined) {
			if (actor.system.abilities[ability] != undefined) {
				if ((actor.system.abilities[ability].altlabel != "") && (actor.system.abilities[ability].altlabel != undefined)) {
					return actor.system.abilities[ability].altlabel;
				}
			}			
		}

		for (const i in CONFIG.worldofdarkness.talents) {
			if (i == ability) {
				return CONFIG.worldofdarkness.talents[i];
			}
		}

		for (const i in CONFIG.worldofdarkness.skills) {
			if (i == ability) {
				return CONFIG.worldofdarkness.skills[i];
			}
		}

		for (const i in CONFIG.worldofdarkness.knowledges) {
			if (i == ability) {
				return CONFIG.worldofdarkness.knowledges[i];
			}
		}	

		for (const i in CONFIG.worldofdarkness.advantages) {
			if (i == ability) {
				return CONFIG.worldofdarkness.advantages[i];
			}
		}

		// attribute then?
		let list;

		if (CONFIG.worldofdarkness.attributeSettings == "5th") {
			list = CONFIG.worldofdarkness.attributes;
		}
		else if (CONFIG.worldofdarkness.attributeSettings == "20th") {
			list = CONFIG.worldofdarkness.attributes20;
		}
		
		for (const i in list) {
			if (i == ability) {
				return list[i];
			}
		}

		for (const i in CONFIG.worldofdarkness.advantages) {
			if (i == ability) {
				return CONFIG.worldofdarkness.advantages[i];
			}
		}

		return ability;
	});

	Handlebars.registerHelper("getAbilityLabel", function (ability) {
		if ((ability.altlabel == "") || (ability.altlabel == undefined)) {
			return game.i18n.localize(ability.label);
		}
		
		return ability.altlabel;
	});

	Handlebars.registerHelper("topAttributes", function (attribute) {
		var list = ["strength","charisma","perception"];

		if (CONFIG.worldofdarkness.attributeSettings == "5th") {
			list = ["strength","charisma","intelligence"];
		}
		
		if (list.includes(attribute)) {
			return true;
		}
		else {
			return false;
		}
	});

	Handlebars.registerHelper("bottenAttributes", function (attribute) {
		var list = ["stamina","appearance","wits"];

		if (CONFIG.worldofdarkness.attributeSettings == "5th") {
			list = ["stamina","composure","resolve"];
		}
		
		if (list.includes(attribute)) {
			return true;
		}
		else {
			return false;
		}
	});

	Handlebars.registerHelper("showAbility", function (ability, abilityType, actor) {
		const sheetType = actor.type;
		const variant = actor.system.settings.variant;

		if (ability == "research") {
			if (((sheetType == CONFIG.worldofdarkness.sheettype.hunter)||(sheetType == CONFIG.worldofdarkness.sheettype.demon)) && 
					((sheetType == CONFIG.worldofdarkness.sheettype.mortal) && (variant == 'sorcerer')) &&
					(abilityType == "skills")) {
				return false;
			}
			else if (((sheetType == CONFIG.worldofdarkness.sheettype.hunter)||(sheetType == CONFIG.worldofdarkness.sheettype.demon)||(sheetType == CONFIG.worldofdarkness.sheettype.mummy)) && 
					((sheetType == CONFIG.worldofdarkness.sheettype.mortal) && (variant == 'sorcerer')) &&
					(abilityType == "knowledges")) {
				return true;
			}
			else if (abilityType == "skills") {
				return true;
			}
			else if (abilityType == "knowledges") {
				return false;
			}
		}
		if (ability == "technology") {
			if (((sheetType == CONFIG.worldofdarkness.sheettype.hunter)||(sheetType == CONFIG.worldofdarkness.sheettype.mage)||(sheetType == CONFIG.worldofdarkness.sheettype.demon)||(sheetType == CONFIG.worldofdarkness.sheettype.mummy)||
					((sheetType == CONFIG.worldofdarkness.sheettype.mortal) && ((variant == 'orpheus') || (variant == 'sorcerer'))) && 
					(abilityType == "skills"))) {
				return true;
			}
			else if (((sheetType == CONFIG.worldofdarkness.sheettype.hunter)||(sheetType == CONFIG.worldofdarkness.sheettype.mage)||(sheetType == CONFIG.worldofdarkness.sheettype.demon)||(sheetType == CONFIG.worldofdarkness.sheettype.mummy)||
					((sheetType == CONFIG.worldofdarkness.sheettype.mortal) && ((variant == 'orpheus') || (variant == 'sorcerer'))) && 
					(abilityType == "knowledges"))) {
				return false;
			}
			else if (abilityType == "skills") {
				return false;
			}
			else if (abilityType == "knowledges") {
				return true;
			}
		}

		return true;
	}); 

	Handlebars.registerHelper("getAbilityAttribute" , function (actor, ability, attribute) {
		let value = "";

		if (actor.system.abilities == undefined) {
			return value;
		}

		if (attribute == "label") {
			value = game.i18n.localize(actor.system.abilities[ability][attribute]);
		}
		if (attribute == "altlabel") {
			value = actor.system.abilities[ability][attribute];
		}
		if (attribute == "isvisible") {
			value = actor.system.abilities[ability][attribute];
		}		 

		return value;
	});

	// Check if an ability should show the speciality icon (application_v1)
	Handlebars.registerHelper("hasSpeciality" , function (ability, type) {
		// opens in dialog to edit speciality
		if (ability.typeform == "attribute") {
			return true;
		}

		let hasSpeciality = false;
		let id = ability._id;
		let specialityLevel = 4;

		if (ability.id != undefined) {
			id = ability.id;
		}

		if ((CONFIG.worldofdarkness.specialityLevel != undefined) && (Functions.isNumber(CONFIG.worldofdarkness.specialityLevel))) {
			specialityLevel = parseInt(CONFIG.worldofdarkness.specialityLevel);
		}

		if (ability?.type === "Ability") {
			if (ability.system.value >= specialityLevel) {
				hasSpeciality = true;
			}
			else if (ability.system.value >= 1) {
				hasSpeciality = ability.system.settings.alwaysspeciality;
			}
		}
		// legacy
		else {
			if (ability.value >= specialityLevel) {
				hasSpeciality = true;
			}
			else if (ability.value >= 1) {
				type = type.toLowerCase();

				if (CONFIG.worldofdarkness.alwaysspeciality[type] == undefined) {
					type = "vampire";
				}

				hasSpeciality = CONFIG.worldofdarkness.alwaysspeciality[type].includes(id); 							
			}
		}
				

		return hasSpeciality;
	});

	Handlebars.registerHelper("getSpecialityIcon" , function (ability) {
		let specialityLevel = 4;

		if ((CONFIG.worldofdarkness.specialityLevel != undefined) && (Functions.isNumber(CONFIG.worldofdarkness.specialityLevel))) {
			specialityLevel = parseInt(CONFIG.worldofdarkness.specialityLevel);
		}

		if ((ability.system.settings.alwaysspeciality) && (ability.system.speciality !== "") && (ability.system.value >= 1)) {
			return 'item-notice';
		}
		if ((ability.system.settings.alwaysspeciality) && (ability.system.speciality === "") && (ability.system.value >= 1)) {
			return 'item-warning';
		}
		if ((ability.system.value >= specialityLevel) && (ability.system.speciality !== "")) {
			return 'item-notice';
		}
		if ((ability.system.value >= specialityLevel) && (ability.system.speciality === "")) {
			return 'item-warning';
		}

		return "";
	});

	/**
	 * @deprecated Legacy Actor only - Used only by legacy Werewolf and Changing Breed actor sheets
	 */
	Handlebars.registerHelper("shifterHasForm", function (actor, form) {
		if (actor.system.shapes[form].isactive) {
			return true;
		}
		else {
			return false;
		}
	});
	
	/**
	 * @deprecated Legacy Actor only - Used only by legacy Werewolf and Changing Breed actor sheets
	 */
	Handlebars.registerHelper("getShifterRank", function (actor) {
		return actor.GetShifterRank();
	});

	/**
	 * Fetches the total bonus a shifter have on the sheet and return the value
	 * @param actor 		- the actor in itself
	 * @param form			- the form you wish to fetch value from (homid, glabro, crinos, hispo, lupus)
	 * @param attribute		- the attribute searched for
	 * @param istext		- TRUE / FALSE if the return is to be a STRING or integer
	 * @return {Promise}
	 * @deprecated Legacy Actor only - Used only by legacy Werewolf and Changing Breed actor sheets
	 */
	Handlebars.registerHelper("getShifterAttrbuteBonus", function (actor, form, attribute, istext) {
		const type = "Bonus";

		let items = (actor.items.filter(i => i.type === type && i.system.parentid === form && i.system.settingtype === attribute));

		if (items.length == 0) {
			return "0";
		}

		if (istext) {
			if (items[0].system.value > 0) {
				return "+" + items[0].system.value;
			}
		}
		
		return items[0].system.value;
	});

	/**
	 * Gets all attribute bonuses from shapeform item's bonuslist, sorted by type (attribute_buff first, then attribute_diff)
	 * @param shapeformItem - the shapeform item
	 * @return {Array} - array of bonus objects sorted by type
	 */
	Handlebars.registerHelper("getShapeformAttributeBonuses", function (shapeformItem) {
		if (!shapeformItem?.system?.bonuslist || shapeformItem.system.bonuslist.length === 0) {
			return [];
		}

		// Filter for attribute bonuses only (attribute_buff and attribute_diff)
		const attributeBonuses = shapeformItem.system.bonuslist.filter(b => 
			b.type === "attribute_buff" || b.type === "attribute_diff" || b.type === "attribute_fixed_value"
		);

		// Sort: attribute_buff first, then attribute_diff
		attributeBonuses.sort((a, b) => {
			// attribute_buff comes before attribute_diff
			if (a.type === "attribute_buff" && b.type === "attribute_diff") {
				return -1;
			}
			if (a.type === "attribute_diff" && b.type === "attribute_buff") {
				return 1;
			}
			// Within same type, sort alphabetically by settingtype
			return a.settingtype.localeCompare(b.settingtype);
		});

		return attributeBonuses;
	});

	/**
	 * Gets attribute short name localization key from attribute name (e.g. "strength" -> "wod.attributes.short.str")
	 * @param attributeName - the attribute name (e.g. "strength", "dexterity")
	 * @return {String} - the full localization key (e.g. "wod.attributes.short.str") or full attribute name if no mapping
	 */
	Handlebars.registerHelper("getAttributeShortKey", function (attributeName) {
		const shortNameMap = {
			"strength": "wod.attributes.short.str",
			"dexterity": "wod.attributes.short.dex",
			"stamina": "wod.attributes.short.sta",
			"manipulation": "wod.attributes.short.man",
			"appearance": "wod.attributes.short.app",
			"perception": "wod.attributes.perception",
			"wits": "wod.attributes.wits",
			"intelligence": "wod.attributes.intelligence",
			"charisma": "wod.attributes.charisma",
			"composure": "wod.attributes.composure",
			"resolve": "wod.attributes.resolve"
		};

		return shortNameMap[attributeName?.toLowerCase()] || attributeName;
	});

	/**
	 * Formats bonus value as string with + prefix for positive values
	 * @param bonus - the bonus object with value property
	 * @return {String} - formatted bonus value (e.g. "+2", "-1", "0")
	 */
	Handlebars.registerHelper("formatBonusValue", function (bonus) {
		if (!bonus || bonus.value === undefined || bonus.value === null) {
			return "0";
		}

		const value = Number(bonus.value);
		if (value > 0) {
			return "+" + value;
		}
		return value.toString();
	});

	Handlebars.registerHelper("topSpheres", function (sphere) {
		var list = ["correspondence","life","prime"];

		if (list.includes(sphere)) {
			return true;
		}
		else {
			return false;
		}
	});

	Handlebars.registerHelper("bottenSpheres", function (sphere) {
		var list = ["forces","mind","time"];

		if (list.includes(sphere)) {
			return true;
		}
		else {
			return false;
		}
	});

	Handlebars.registerHelper("damageState", function (healthLevel, healthStates, index) {
		let num = 0;
		let oldHealthLevel = "";

		if (healthStates == undefined) {
			return "";
		}

		for (const i of healthStates) {
			if (oldHealthLevel != healthLevel) {
				num = 0;
				oldHealthLevel = healthLevel;
			}

			if (i.label == healthLevel) {
				if (num == index) {
					return i.status;
				}

				num += 1;
			}			
		}

		return "";
	});

	Handlebars.registerHelper("getInjuredLevel", function (type, health) {
		let totalDamage = health.damage.bashing + health.damage.lethal + health.damage.aggravated;
		if (totalDamage == 0) return game.i18n.localize("wod.health.uninjured");

		totalDamage = totalDamage - health.bruised.total;
		if (totalDamage <= 0) return game.i18n.localize("wod.health.bruised");

		totalDamage = totalDamage - health.hurt.total;
		if (totalDamage <= 0) return game.i18n.localize("wod.health.hurt");

		totalDamage = totalDamage - health.injured.total;
		if (totalDamage <= 0) return game.i18n.localize("wod.health.injured");

		totalDamage = totalDamage - health.wounded.total;
		if (totalDamage <= 0) return game.i18n.localize("wod.health.wounded");

		totalDamage = totalDamage - health.mauled.total;
		if (totalDamage <= 0) return game.i18n.localize("wod.health.mauled");

		totalDamage = totalDamage - health.crippled.total;
		if (totalDamage <= 0) return game.i18n.localize("wod.health.crippled");

		if (type != CONFIG.worldofdarkness.sheettype.mummy) {
			return game.i18n.localize("wod.health.incapacitated");
		}

		totalDamage = totalDamage - health.damage.bashing;
		
		if (totalDamage <= 1) return game.i18n.localize("wod.health.incapacitated");
		if (totalDamage == 2) return game.i18n.localize("wod.health.broken");
		if (totalDamage == 3) return game.i18n.localize("wod.health.crushed");
		if (totalDamage == 4) return game.i18n.localize("wod.health.dismembered");
		if (totalDamage == 5) return game.i18n.localize("wod.health.pulverized");
		if (totalDamage >= 6) return game.i18n.localize("wod.health.dust");
	});	

	/**
	 * @deprecated Legacy Actor only - Used only by legacy Mage actor sheets. PC Actor uses quintessenceWheel_v2 instead.
	 */
	Handlebars.registerHelper("quintessenceWheel", function (quintessence, paradox, index) {
		let state = "";
		const square = index + 1;

		if ((paradox.permanent > 0) && (20 - paradox.permanent  < square)) {
			state = "*";
			return state;
		}

		if ((paradox.temporary > 0) && (20 - (paradox.permanent + paradox.temporary) < square)) {
			state = "x";
			return state;
		}

		if ((quintessence.temporary > 0) && (square <= quintessence.temporary))  {
			state = "Ψ";
			return state;
		}

		return state;
	});

	Handlebars.registerHelper("quintessenceWheel_v2", function (quintessence, paradox, index) {
		let state = "";

		if ((quintessence == undefined) || (paradox == undefined)) {
			return state;
		}

		const square = index + 1;



		if ((paradox.system.permanent > 0) && (20 - paradox.system.permanent  < square)) {
			state = "*";
			return state;
		}

		if ((paradox.system.temporary > 0) && (20 - (paradox.system.permanent + paradox.system.temporary) < square)) {
			state = "x";
			return state;
		}

		if ((quintessence.system.temporary > 0) && (square <= quintessence.system.temporary))  {
			state = "Ψ";
			return state;
		}

		return state;
	});

	/**
	 * @deprecated Legacy Actor only - Used only by legacy Werewolf actor sheets
	 */
	Handlebars.registerHelper("getGiftList", function (gifts, rank) {
		let list = [];

		if (rank == 1) {
			list = gifts.powerlist1;
		}
		else if (rank == 2) {
			list = gifts.powerlist2;
		}
		else if (rank == 3) {
			list = gifts.powerlist3;
		}
		else if (rank == 4) {
			list = gifts.powerlist4;
		}
		else if (rank == 5) {
			list = gifts.powerlist5;
		}
		else if (rank == 6) {
			list = gifts.powerlist6;
		}

		return list;
	});

	/**
	 * @deprecated Legacy Actor only - Used only by legacy actor sheets
	 */
	Handlebars.registerHelper("getProperty", function (properties, name) {
		if (properties.length == 0) {
			return "";
		}

		if (properties[name] == undefined) {
			return "";
		}

		return game.i18n.localize(properties[name]);
	});

	/**
	 * @deprecated Legacy Actor only - Used only by legacy actor sheets
	 */
	Handlebars.registerHelper("translateConceal", function (conceal, era, fullname) {

		if (era == undefined) {
			era = CONFIG.worldofdarkness.era.modern;
		}
		
		if (fullname) {
			if (era == CONFIG.worldofdarkness.era.modern) {
				if (conceal == "P") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.pocket");
				}
				if (conceal == "J") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.jacket");
				}
				if (conceal == "T") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.trenchcoat");
				}
				if (conceal == "NA") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.na");
				}
			}

			if (era == CONFIG.worldofdarkness.era.victorian) {
				if (conceal == "P") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.pocket");
				}
				if (conceal == "J") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.jacket");
				}
				if (conceal == "T") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.trenchcoat");
				}
				if (conceal == "NA") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.na");
				}
			}

			if ((era == CONFIG.worldofdarkness.era.darkages) || (era == CONFIG.worldofdarkness.era.classical) || (era == CONFIG.worldofdarkness.era.livinggods)) {
				if (conceal == "P") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.pouch");
				}
				if (conceal == "J") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.loose");
				}
				if (conceal == "T") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.cloak");
				}
				if (conceal == "NA") {
					conceal = game.i18n.localize("wod.combat.weapon.conceal.notbeconcealed");
				}
			}
		}
		else {
			if (era == CONFIG.worldofdarkness.era.darkages) {
				if (conceal == "J") {
					conceal = "C";
				}
				if (conceal == "T") {
					conceal = "L";
				}
			}
		}		

		return conceal;
	});

	Handlebars.registerHelper("getBioList", function(list, section) {
		if (list == undefined) {
			return [];
		}
		if (list[section] == undefined) {
			return [];
		}

		return list[section];
	});

 	Handlebars.registerHelper("isChecked", function(value) {
		if (value == undefined) {
			return "";
		}

		if (value) {
			return "checked";
		}

		return "";
	}); 

	Handlebars.registerHelper("isActive", function(stat, value) {
		if (stat == value) {
			return "active";
		}

		return "";
	});

	Handlebars.registerHelper("captilizeFirst", function (text) {
		return text.charAt(0).toUpperCase() + text.slice(1);
	});

	Handlebars.registerHelper("firstLetter", function (text) {
		return text.charAt(0).toUpperCase();
	});

	Handlebars.registerHelper("checkSystemsetting", function (text) {
		if (text == "attributeSettings") {
			return CONFIG.worldofdarkness.attributeSettings;
		}

		if (text == "fifthEditionWillpowerSetting") {
			return CONFIG.worldofdarkness.fifthEditionWillpowerSetting;
		}

		if (text == "willpowerBonusDice") {
			return CONFIG.worldofdarkness.willpowerBonusDice;
		}

		if (text == "rollSettings") {
			return CONFIG.worldofdarkness.rollSettings;
		}

		if (text == "specialityLevel") {
			return CONFIG.worldofdarkness.specialityLevel;
		}

		if (text == "theRollofOne") {
			return CONFIG.worldofdarkness.handleOnes;
		}

		if (text == "useOnesDamage") {
			return CONFIG.worldofdarkness.useOnesDamage;
		}

		if (text == "usePenaltyDamage") {
			return CONFIG.worldofdarkness.usePenaltyDamage;
		}		

		if (text == "useOnesSoak") {
			return CONFIG.worldofdarkness.useOnesSoak;
		}

		if (text == "lowestDifficulty") {
			return CONFIG.worldofdarkness.lowestDifficulty;
		}

		if (text == "lowestDifficulty") {
			return CONFIG.worldofdarkness.lowestDifficulty;
		}

		if (text == "specialityAddSuccess") {
			return CONFIG.worldofdarkness.specialityAddSuccess;
		}				

		if (text == "specialityReduceDiff") {
			return CONFIG.worldofdarkness.specialityReduceDiff;
		}

		if (text == "specialityAllowBotch") {
			return CONFIG.worldofdarkness.specialityAllowBotch;
		}	

		if (text == "specialityAllowBotch") {
			return CONFIG.worldofdarkness.specialityAllowBotch;
		}	
		
		if (text == "tenAddSuccess") {
			return CONFIG.worldofdarkness.tenAddSuccess;
		}

		if (text == "explodingDice") {
			return CONFIG.worldofdarkness.explodingDice;
		}

		if (text == "wererwolfrageSettings") {
			return CONFIG.worldofdarkness.wererwolfrageSettings;
		}		

		if (text == "viewBiotabPermission") {
			if (game.user.isGM) {
				return "full";
			}

			if (this.actor.isOwner) {
				return "full";
			}

			if (this.actor.limited) {
				return CONFIG.worldofdarkness.limitedSeeFullActor;
			}

			return CONFIG.worldofdarkness.observersSeeFullActor;
		}

		return false;
	});

	Handlebars.registerHelper("captilize", function (text) {
		return text.toUpperCase();
	});

	Handlebars.registerHelper("lowercase", function (text) {
		return text.toLowerCase();
	});

	Handlebars.registerHelper("isEmpty", function (list) {
		if (list == undefined) {
			return true;
		}

		if (list.length == 0) {
			return true;
		}
		else {
			return false;
		}
	});

	Handlebars.registerHelper("convertDamageCode", function (attribute, bonus, type) {
		let code = "";

		if ((type != undefined) && (type != "")) {
			type = game.i18n.localize(CONFIG.worldofdarkness.damageTypes[type]).charAt(0).toUpperCase();
		}
		else {
			type = "";
		}		

		if ((attribute != undefined) && (attribute != "")) {
			code = game.i18n.localize(CONFIG.worldofdarkness.attributes20[attribute]).substring(0, 3);
		}		

		if (code == "") {
			code = bonus;
		}
		else if (bonus > 0) {
			code += "+"+bonus;
		}
		else if (bonus < 0) {
			code += "-"+bonus;
		}

		code += " " + type;

		return code;
	});

	Handlebars.registerHelper("ignorePain", function (value) {
		let ignoresPain = false;

		if (this.actor.system.conditions?.isignoringpain)
		{
			ignoresPain = true;
		}

		if (this.actor.system.conditions?.isfrenzy)
		{
			ignoresPain = true;
		}

		if (ignoresPain) {
			return 0;
		}
		else {
			return value;
		}
	});

	Handlebars.registerHelper("calculateHight", function (area, list) {
		if (area == "rotes") {
			if (list.length < 26) {
				return "max-height: 350px";
			}
			else {
				const height = Math.ceil(350 / 25 *list.length);

				return "max-height: " + height + "px";
			}
		}
	});

	function getAttributes(attribute) {
		let list;

		if (CONFIG.worldofdarkness.attributeSettings == "5th") {
			list = CONFIG.worldofdarkness.attributes;
		}
		else if (CONFIG.worldofdarkness.attributeSettings == "20th") {
			list = CONFIG.worldofdarkness.attributes20;
		}
		
		for (const i in list) {
			if (i == attribute) {
				return list[i];
			}
		}

		for (const i in CONFIG.worldofdarkness.advantages) {
			if (i == attribute) {
				return CONFIG.worldofdarkness.advantages[i];
			}
		}

		return attribute;
	}

	function getAbility(actor, ability) {
		if (ability == "") {
			return "";
		}

		if (actor != undefined) {
			if (actor.system.abilities[ability] != undefined) {
				if ((actor.system.abilities[ability].altlabel != "") && (actor.system.abilities[ability].altlabel != undefined)) {
					return actor.system.abilities[ability].altlabel;
				}
			}			
		}

		for (const i in CONFIG.worldofdarkness.talents) {
			if (i == ability) {
				return CONFIG.worldofdarkness.talents[i];
			}
		}

		for (const i in CONFIG.worldofdarkness.skills) {
			if (i == ability) {
				return CONFIG.worldofdarkness.skills[i];
			}
		}

		for (const i in CONFIG.worldofdarkness.knowledges) {
			if (i == ability) {
				return CONFIG.worldofdarkness.knowledges[i];
			}
		}	

		for (const i in CONFIG.worldofdarkness.advantages) {
			if (i == ability) {
				return CONFIG.worldofdarkness.advantages[i];
			}
		}

		// attribute then?
		let list;

		if (CONFIG.worldofdarkness.attributeSettings == "5th") {
			list = CONFIG.worldofdarkness.attributes;
		}
		else if (CONFIG.worldofdarkness.attributeSettings == "20th") {
			list = CONFIG.worldofdarkness.attributes20;
		}
		
		for (const i in list) {
			if (i == ability) {
				return list[i];
			}
		}

		for (const i in CONFIG.worldofdarkness.advantages) {
			if (i == ability) {
				return CONFIG.worldofdarkness.advantages[i];
			}
		}

		return ability;
	}
}

