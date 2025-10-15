export interface MagicLinkEmailData {
    firstName: string;
    magicLink: string;
    team: string;
    program?: string;
}
export declare class EmailTemplates {
    /**
     * Magic link login email template
     */
    static magicLinkEmail(data: MagicLinkEmailData): string;
    /**
     * Welcome email template for new students
     */
    static welcomeEmail(data: {
        firstName: string;
        lastName: string;
        team: string;
        program?: string;
        personalLink: string;
        qrCodeUrl?: string;
    }): string;
}
//# sourceMappingURL=emailTemplates.d.ts.map