const rub = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

/** 12500 → «12 500 ₽» */
export const formatPrice = (rubles: number) => `${rub.format(rubles)} ₽`;
