"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatIDR = void 0;
function formatIDR(amount) {
    if (amount === 0)
        return 'Rp0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}
exports.formatIDR = formatIDR;
//# sourceMappingURL=formatIDR.js.map