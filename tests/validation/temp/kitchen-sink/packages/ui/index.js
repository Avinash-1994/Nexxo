
        import { formatDate } from '../utils/index.js'; 
        export const Button = (label) => `<button reset="${formatDate(Date.now())}">${label}</button>`;
    