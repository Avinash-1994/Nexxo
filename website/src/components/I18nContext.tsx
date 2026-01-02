import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi';

interface I18nContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        'nav.home': 'Home',
        'nav.docs': 'Docs',
        'nav.guides': 'Guides',
        'hero.title': 'The Honest Build System.',
        'hero.subtitle': 'Urja is a production-grade build engine designed for technical architects.',
    },
    hi: {
        'nav.home': 'मुख्य पृष्ठ',
        'nav.docs': 'दस्तावेज़',
        'nav.guides': 'मार्गदर्शिका',
        'hero.title': 'ईमानदार निर्माण प्रणाली।',
        'hero.subtitle': 'Urja तकनीकी आर्किटेक्ट्स के लिए डिज़ाइन किया गया एक प्रोडक्शन-ग्रेड बिल्ड इंजन है।',
    }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<Language>('en');

    const t = (key: string) => translations[lang][key] || key;

    return (
        <I18nContext.Provider value={{ lang, setLang, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useI18n must be used within I18nProvider');
    return context;
};
