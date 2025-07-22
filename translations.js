// Translation system for Alessandro Bocquet Portfolio
class TranslationManager {
    constructor() {
        this.currentLanguage = 'fr'; // Default language
        this.translations = {};
        this.init();
    }

    async init() {
        // Load default language
        await this.loadLanguage(this.currentLanguage);
        
        // Set up language switcher event listeners
        this.setupLanguageSwitcher();
        
        // Apply translations to the page
        this.applyTranslations();
        
        // Update active flag
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
            // Fallback to French if loading fails
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
        await this.loadLanguage(language);
        this.applyTranslations();
        this.updateActiveFlag();
        
        // Update page language attribute
        document.documentElement.lang = language;
        
        // Store language preference
        localStorage.setItem('preferred-language', language);
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
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    updateActiveFlag() {
        // Remove active class from all flags
        document.querySelectorAll('[data-lang]').forEach(flag => {
            flag.classList.remove('active-flag', 'active-flag-middle');
        });
        
        // Add active class to current language flag
        const currentFlag = document.querySelector(`[data-lang="${this.currentLanguage}"]`);
        if (currentFlag) {
            // Apply different classes based on position (you might want to adjust this logic)
            if (this.currentLanguage === 'en') {
                currentFlag.classList.add('active-flag-middle');
            } else {
                currentFlag.classList.add('active-flag');
            }
        }
    }

    // Initialize from stored preference
    initializeFromStorage() {
        const storedLanguage = localStorage.getItem('preferred-language');
        if (storedLanguage && ['fr', 'en', 'it'].includes(storedLanguage)) {
            this.changeLanguage(storedLanguage);
        }
    }
}

// Initialize translation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const translationManager = new TranslationManager();
    
    // Check for stored language preference
    translationManager.initializeFromStorage();
});
