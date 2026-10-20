/** «004219880716» → «0042 1988 0716» — как на карте гостя */
export const formatCardNumber = (digits: string) => digits.replace(/(\d{4})(?=\d)/g, "$1 ");
