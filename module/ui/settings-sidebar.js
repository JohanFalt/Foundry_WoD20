/* global game, Hooks */

/* Various additional information added to the Settings sidebar */
export const RenderSettings = async () => {
    Hooks.on('renderSettings', async (_app, html) => {
        // Additional system information resources
        const systemRow = html.find('#game-details li.system');
  
        const systemLinks = `
            <li class='external-system-links'>
                <a href='https://github.com/JohanFalt/Foundry_WoD20/wiki/Changelog' target='_blank'>${game.i18n.localize( "wod.info.changelog")}</a>
                |
                <a href='https://github.com/JohanFalt/Foundry_WoD20/wiki' target='_blank'>${game.i18n.localize( "wod.info.wiki")}</a>
            </li>`;
  
        $(systemLinks).insertAfter(systemRow)
  
        // License Section
        const settingsAccess = html.find('#settings-access')
        const licenseInformation = `
            <h2>Licensed Dark Pack Agreement</h2>
            <div id='license-information'>
                Portions of the materials are the copyrights and trademarks of Paradox Interactive AB, and are used with permission. All rights reserved. For more information please visit <a href="https://www.worldofdarkness.com/">worldofdarkness.com</a>.<br /><br />
                <a href="https://www.paradoxinteractive.com/games/world-of-darkness/community/dark-pack-agreement"><img src="https://raw.githubusercontent.com/JohanFalt/Foundry_WoD20/main/doc/darkpack_logo2.png" /></a>
            </div>`;
        $(licenseInformation).insertAfter(settingsAccess)
    })
}