import type { Variants } from "motion/react"

export  const leftButtonInnerVariants: Variants = {
  show: {
    x: -5, 
    transition: {
      duration: .2, type: "spring", stiffness: 100
    }
  },
  hover: {
    x: -15,
    transition: {
      duration: .2, type: "spring", stiffness: 100
    }
  },
  tap: {
    x: -20,
    transition: {
      duration: .2, type: "spring", stiffness: 100
    }
  }
}

export const leftButtonVariants: Variants = {
  show: {
    borderColor: "#fff",
    transition: {duration: .2, type: "spring", stiffness: 100} 
  },
  hover: {
    borderColor: "#bbb",
    transition: {duration: .2, type: "spring", stiffness: 100},
  },
  tap: {
    borderColor: "#999",
    transition: {duration: .2, type: "spring", stiffness: 100},
  }
}

export const rightButtonVariants: Variants = {
  show: {
    borderColor: "#fff",
    transition: {duration: .2, type: "spring", stiffness: 100} 
  },
  hover: {
    borderColor: "#bbb",
    transition: {duration: .2, type: "spring", stiffness: 100},
  },
  tap: {
    borderColor: "#999",
    transition: {duration: .2, type: "spring", stiffness: 100},
  }
}

export const rightButtonInnerVariants: Variants = {
  show: {
    x: 5, 
    transition: {
      duration: .2, type: "spring", stiffness: 100
    }
  },
  hover: {
    x: 15,
    transition: {
      duration: .2, type: "spring", stiffness: 100
    }
  },
  tap: {
    x: 20,
    transition: {
      duration: .2, type: "spring", stiffness: 100
    }
  }

}
