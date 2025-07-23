// Translation Management
class TranslationManager {
    constructor() {
        this.currentLanguage = 'fr';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadLanguage(this.currentLanguage);
        this.setupLanguageSwitcher();
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
            if (language !== 'fr') {
                await this.loadLanguage('fr');
            }
        }
    }

    setupLanguageSwitcher() {
        const languageButtons = document.querySelectorAll('[data-lang]');
        languageButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const language = button.getAttribute('data-lang');
                await this.changeLanguage(language);
            });
        });
    }

    async changeLanguage(language) {
        // Instantly hide all translatable content
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            element.style.visibility = 'hidden';
        });
        
        // Load new language and apply translations
        await this.loadLanguage(language);
        this.applyTranslations();
        this.updateActiveFlag();
        
        // Update page language attribute
        document.documentElement.lang = language;
        
        // Store language preference
        localStorage.setItem('preferred-language', language);
        
        // Show content again instantly
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
                // Handle special cases for elements with HTML content
                if (key === 'aboutDesc') {
                    // Preserve the link in the about description
                    const linkMatch = element.innerHTML.match(/<a[^>]*>.*?<\/a>/);
                    if (linkMatch) {
                        element.innerHTML = translation.replace('Digital and Interaction Design', linkMatch[0]);
                    } else {
                        element.textContent = translation;
                    }
                } else if (key.includes('subtitle') && element.querySelector('a')) {
                    // Preserve links in subtitles
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
        
        // Update cursor position after translation changes
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
            if (this.currentLanguage === 'en') {
                currentFlag.classList.add('active-flag-middle');
            } else {
                currentFlag.classList.add('active-flag');
            }
        }
    }

    initializeFromStorage() {
        const storedLanguage = localStorage.getItem('preferred-language');
        if (storedLanguage && ['fr', 'en', 'it'].includes(storedLanguage)) {
            this.changeLanguage(storedLanguage);
        }
    }
}

// Initialize Translation Manager
document.addEventListener('DOMContentLoaded', () => {
    const translationManager = new TranslationManager();
    translationManager.initializeFromStorage();
});
