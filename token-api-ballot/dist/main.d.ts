import 'dotenv/config';
declare global {
    interface BigInt {
        toJSON(): string;
    }
}
