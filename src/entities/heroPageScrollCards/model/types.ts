/** [x, y, ширина] — координаты из макета 1920 (артборд Wood) */
export type TextBox = [x: number, y: number, width: number]
/** [x, y, ширина, высота] */
export type ImageBox = [x: number, y: number, width: number, height: number]

export type ScrollCard = {
    image: string,
    /** Сторона, где лежит рваная бумага с бутылкой; текст — с противоположной */
    side: ScrollSide,
    title: string,
    body: string,
    layout: {
        title: TextBox,
        body: TextBox,
        paper: ImageBox,
        bottle: ImageBox,
    }
}

export type ScrollSide = "left" | "right"
