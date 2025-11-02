class TranslationManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.languageSwitcherSetup = false;
        this.init();
    }
    async init() {
        await this.loadLanguage(this.currentLanguage);
        if (!this.languageSwitcherSetup) {
            this.setupLanguageSwitcher();
            this.languageSwitcherSetup = true;
        }
        this.applyTranslations();
        this.updateActiveFlag();
    }
    async loadLanguage(language) {
        try {
            const response = await fetch(`/translations/${language}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load language: ${language}`);
            }
            this.translations = await response.json();
            this.currentLanguage = language;
        } catch (error) {
            console.error('Error loading language:', error);
            if (language !== 'en') {
                await this.loadLanguage('en');
            }
        }
    }
    setupLanguageSwitcher() {
        // Use event delegation to avoid duplicate listeners - only set up once
        if (this._languageClickHandler) {
            return; // Already set up
        }
        this._languageClickHandler = async (e) => {
            const languageButton = e.target.closest('[data-lang]');
            if (languageButton) {
                e.preventDefault();
                e.stopPropagation();
                const language = languageButton.getAttribute('data-lang');
                if (language && ['en', 'fr', 'it'].includes(language)) {
                    await this.changeLanguage(language);
                }
            }
        };
        document.addEventListener('click', this._languageClickHandler);
    }
    async changeLanguage(language) {
        if (!language || !['en', 'fr', 'it'].includes(language)) {
            console.warn('Invalid language:', language);
            return;
        }
        // Prevent unnecessary language changes
        if (language === this.currentLanguage) {
            return;
        }
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            element.style.visibility = 'hidden';
        });
        await this.loadLanguage(language);
        this.applyTranslations();
        this.updateActiveFlag();
        document.documentElement.lang = language;
        localStorage.setItem('preferred-language', language);
        elements.forEach(element => {
            element.style.visibility = 'visible';
        });
    }
    applyTranslations() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getNestedValue(this.translations, key);
            if (translation) {
                if (key === 'aboutDesc') {
                    const linkMatch = element.innerHTML.match(/<a[^>]*>.*?<\/a>/);
                    if (linkMatch) {
                        element.innerHTML = translation.replace('Digital and Interaction Design', linkMatch[0]);
                    } else {
                        element.textContent = translation;
                    }
                } else if (key.includes('subtitle') && element.querySelector('a')) {
                    const link = element.querySelector('a');
                    if (link) {
                        const linkHTML = link.outerHTML;
                        element.innerHTML = translation.replace('Université de Strasbourg', linkHTML);
                    } else {
                        element.textContent = translation;
                    }
                } else {
                    element.textContent = translation;
                }
            }
        });
        setTimeout(() => {
            const activeLink = document.querySelector('#menu a.active');
            if (activeLink && window.updateCursorPosition) {
                window.updateCursorPosition(activeLink);
            }
        }, 50);
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }
    updateActiveFlag() {
        document.querySelectorAll('[data-lang]').forEach(flag => {
            flag.classList.remove('active-flag', 'active-flag-middle');
        });
        const currentFlag = document.querySelector(`[data-lang="${this.currentLanguage}"]`);
        if (currentFlag) {
            if (this.currentLanguage === 'fr') {
                currentFlag.classList.add('active-flag-middle');
            } else {
                currentFlag.classList.add('active-flag');
            }
        }
    }
    async initializeFromStorage() {
        const storedLanguage = localStorage.getItem('preferred-language');
        if (storedLanguage && ['fr', 'en', 'it'].includes(storedLanguage) && storedLanguage !== this.currentLanguage) {
            await this.changeLanguage(storedLanguage);
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    window.translationManager = new TranslationManager();
    window.translationManager.initializeFromStorage();
    
    // Expose setLanguage for compatibility with existing code
    window.setLanguage = async (language) => {
        if (window.translationManager) {
            await window.translationManager.changeLanguage(language);
        }
    };
});