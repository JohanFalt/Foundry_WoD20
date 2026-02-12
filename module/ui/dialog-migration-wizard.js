const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class DialogMigrationWizard extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(messages, readMessageSetting = null) {
        super();
        this.messages = messages || [];
        this.currentPageIndex = 0;
        this.readMessageSetting = readMessageSetting;
        this.dontShowAgainChecked = false;
        
        // Set localized title
        this.options.window.title = game.i18n.localize("wod.dialog.migrationwizard.title");
    }

    static DEFAULT_OPTIONS = {
        id: 'wod-migration-wizard',
        tag: 'div',
        window: {
            title: "Migration Information",
            resizable: true
        },
        classes: ['wod20', 'wod-dialog', 'migration-wizard-dialog'],
        position: {
            width: 600,
            height: 500
        },
        actions: {
            previous: function(event, target) {
                this._onPrevious();
            },
            next: function(event, target) {
                this._onNext();
            },
            close: function(event, target) {
                this._onClose();
            },
            toggleCheckbox: function(event, target) {
                this._onToggleCheckbox(event);
            }
        }
    }

    static PARTS = {
        body: {
            template: 'systems/worldofdarkness/templates/dialogs/dialog-migration-wizard.hbs'
        }
    }

    async _prepareContext() {
        const data = await super._prepareContext();
        
        data.config = CONFIG.worldofdarkness;
        data.messages = this.messages;
        data.currentPageIndex = this.currentPageIndex;
        data.currentMessage = this.messages[this.currentPageIndex] || "";
        data.totalPages = this.messages.length;
        data.isFirstPage = this.currentPageIndex === 0;
        data.isLastPage = this.currentPageIndex === this.messages.length - 1;
        data.pageNumber = this.currentPageIndex + 1;
        data.readMessageSetting = this.readMessageSetting;
        data.showCheckbox = this.readMessageSetting !== null && data.isLastPage;
        data.dontShowAgainChecked = this.dontShowAgainChecked;
        
        return data;
    }

    _onPrevious() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.render();
        }
    }

    _onNext() {
        if (this.currentPageIndex < this.messages.length - 1) {
            this.currentPageIndex++;
            this.render();
        } else {
            // If on last page, close instead
            this._onClose();
        }
    }

    _onToggleCheckbox(event) {
        this.dontShowAgainChecked = event.target.checked;
    }

    _onClose() {
        // If checkbox is checked and we have a setting name, save it
        if (this.dontShowAgainChecked && this.readMessageSetting) {
            game.settings.set('worldofdarkness', this.readMessageSetting, true);
        }
        this.close();
    }
}