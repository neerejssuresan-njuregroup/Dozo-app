
import React, { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

interface DocumentationPageProps {
    activeSection: string;
    onBackToHome: () => void;
}

const DocumentationSection: React.FC<{id: string, title: string, children: React.ReactNode}> = ({ id, title, children }) => (
    <div id={id} className="mb-12 scroll-mt-24">
        <h2 className="text-3xl font-bold text-dozo-charcoal border-b-2 border-dozo-teal pb-2 mb-6">{title}</h2>
        <div className="prose prose-lg max-w-none text-dozo-gray leading-relaxed">
            {children}
        </div>
    </div>
);


const DocumentationPage: React.FC<DocumentationPageProps> = ({ activeSection, onBackToHome }) => {
    
    useEffect(() => {
        if (activeSection) {
            const element = document.getElementById(activeSection);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
             window.scrollTo(0, 0);
        }
    }, [activeSection]);

    return (
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm">
             <button onClick={onBackToHome} className="flex items-center text-sm text-dozo-teal font-semibold hover:underline mb-8">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
            </button>
            
            <DocumentationSection id="company" title="Company">
                <h3 id="about" className="text-2xl font-semibold text-dozo-charcoal-light scroll-mt-24">About Us</h3>
                <p>Dozo is a technology-driven rental subsidiary of Njure Group. Built on the group’s core principles of direct-to-consumer service and radical transparency, Dozo is designed to eliminate the middlemen in the rental market. Whether it is Vastra Thalam’s fashion line or B+ Energies' future transport solutions, Dozo provides the platform to access them all on a flexible, daily, or monthly basis. We aren't just a rental app; we are the digital central intelligence for a smarter lifestyle.</p>

                <h3 id="careers" className="text-2xl font-semibold text-dozo-charcoal-light scroll-mt-24 mt-8">Careers</h3>
                <p>Be part of the Njure Tech revolution. We are looking for bold minds to build the software arm of a family-managed conglomerate. At Dozo, you don't just write code; you build the infrastructure for a bolder, more sustainable Kerala.</p>
                <ul className="list-disc pl-6">
                    <li>Focus: Direct-to-consumer innovation and AI-driven logistics.</li>
                </ul>

                <h3 id="press" className="text-2xl font-semibold text-dozo-charcoal-light scroll-mt-24 mt-8">Press</h3>
                <p>Njure Group Media Hub. Official announcements regarding Dozo’s expansion, B+ Energies' hybrid launches, and Vastra Thalam's collections.</p>
                <ul className="list-disc pl-6">
                    <li>Corporate Inquiries: <a href="mailto:njure.services@gmail.com" className="text-dozo-teal hover:underline">njure.services@gmail.com</a></li>
                </ul>
            </DocumentationSection>

            <DocumentationSection id="support" title="Support">
                <h3 id="help" className="text-2xl font-semibold text-dozo-charcoal-light scroll-mt-24">Help Center</h3>
                <p>Find answers to everything from "How do I rent my first sofa?" to "How do Dozo security deposits work?" Our guide covers item care, delivery timelines, and our AI Damage Guard feature.</p>

                <h3 id="contact" className="text-2xl font-semibold text-dozo-charcoal-light scroll-mt-24 mt-8">Contact Us</h3>
                <ul className="list-none pl-0">
                    <li><strong>Headquarters:</strong> Njure Group, Vattoli Bazar, Balussery, Kozhikode, Kerala - 673612</li>
                    <li><strong>Customer Support:</strong> +91 8281877050</li>
                    <li><strong>Support Email:</strong> <a href="mailto:customer.service.njgroup@gmail.com" className="text-dozo-teal hover:underline">customer.service.njgroup@gmail.com</a></li>
                    <li><strong>Corporate Email:</strong> <a href="mailto:njure.services@gmail.com" className="text-dozo-teal hover:underline">njure.services@gmail.com</a></li>
                </ul>

                <h3 id="trust" className="text-2xl font-semibold text-dozo-charcoal-light scroll-mt-24 mt-8">Trust & Safety</h3>
                <p><strong>Our Safety Promise:</strong> At Njure Group, customer trust is non-negotiable. Dozo employs the group's "Ghost" security principles—ensuring your data is invisible to third parties while your transactions are protected by bank-grade verification (DigiLocker/Aadhaar) and ironclad digital contracts.</p>
            </DocumentationSection>

            <DocumentationSection id="legal" title="Legal">
                <h3 id="terms" className="text-2xl font-semibold text-dozo-charcoal-light scroll-mt-24">Terms of Service</h3>
                <p>All rental agreements are facilitated directly by Njure Group entities, ensuring a direct-to-consumer relationship with no hidden middleman fees. Disputes are subject to the jurisdiction of the courts in Kozhikode.</p>

                <h3 id="privacy" className="text-2xl font-semibold text-dozo-charcoal-light scroll-mt-24 mt-8">Privacy Policy</h3>
                <p>In line with Njure Group’s "Ghost" security ethos, we maintain a zero-third-party data sharing policy. Your personal and biometric data is encrypted and used solely for identity verification.</p>
            </DocumentationSection>

        </div>
    );
};

export default DocumentationPage;
