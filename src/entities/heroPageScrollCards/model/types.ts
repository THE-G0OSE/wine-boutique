export type ScrollCard = {
    image: string,
    scrollFrom: number,
    scrollTo: number,
    horOffset: number,
    vertOffset: number,
    imageVertOffset: number,
    imageHorOffset: number,
    side: ScrollSide,
    title: string,
    body: string
}

export type ScrollSide = "left" | "right"