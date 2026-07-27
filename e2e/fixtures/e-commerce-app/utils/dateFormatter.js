import { format } from 'date-fns';

export function formatDate(d) {
    return format(d, 'yyyy-MM-dd HH:mm');
}

// Unused export - should be eliminated by DCE
export function unusedDeepDateFormatter(d) {
    // We import a heavy unused fn to make DCE obvious
    const { differenceInMonths } = require('date-fns');
    return differenceInMonths(d, new Date());
}
