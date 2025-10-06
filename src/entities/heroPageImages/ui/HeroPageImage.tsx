import type { imageObj } from "@/entities/heroPageImages/model";
import {
  imageVariants,
  innerVariants,
  shadowVariants,
  textContainerVar,
  textVariants,
  transition,
} from "@/entities/heroPageImages/model/animations";
import { AnimatePresence, motion } from "motion/react";
import type { FC } from "react";
import { Flex, Text } from "uikit;/";

interface IProps {
  image: imageObj;
  index: number;
}

const HeroPageImage: FC<IProps> = ({ image, index }) => {
  return (
    <motion.div
      transition={transition(index)}
      variants={imageVariants(index)}
      initial={index === 0 ? "back" : "other"}
      exit={index === 0 ? "back" : "other"}
      animate={index === 0 ? "first" : "other"}
      className="absolute overflow-hidden"
      key={image.path}
    >
      <motion.img
        variants={innerVariants}
        transition={transition(index)}
        src={image.path}
        className="shadow-top size-full object-cover"
      />
      <motion.div
        variants={shadowVariants}
        transition={transition(index)}
        className="absolute inset-0 shadow-top size-full pointer-events-none"
      />
      <AnimatePresence propagate mode="wait">
        {index === 0 ? (
          <Flex
            key={"flex-first"}
            end
            column
            variants={textContainerVar}
            initial={"hide"}
            animate={"show"}
            exit={"hide"}
            className="bottom-170 left-10 absolute w-120 max-w-[calc(100%-1200px)]"
          >
            <AnimatePresence propagate>
              <Text
                COLOR="WHITE"
                SIZE="H4"
                variants={textVariants}
                className="top-0 absolute"
              >
                {image.additional}
              </Text>
              <Text
                COLOR="WHITE"
                SIZE="FIRM"
                FONT="FIRM"
                className="top-10 absolute w-200"
                variants={textVariants}
              >
                {image.title}
              </Text>
              <Text
                COLOR="WHITE"
                SIZE="P"
                className="top-65 absolute mt-10 w-180"
                variants={textVariants}
              >
                {image.content}
              </Text>
            </AnimatePresence>
          </Flex>
        ) : (
          <Flex
            key={"flex-" + image.path}
            end
            column
            className="absolute inset-0 px-4 pb-8"
            variants={textContainerVar}
            initial="hide"
            animate="show"
            exit="hide"
          >
            <AnimatePresence propagate>
              <Text
                COLOR="WHITE"
                SIZE="SMALL"
                key={image.path + "-add"}
                variants={textVariants}
              >
                {image.additional}
              </Text>
              <Text
                COLOR="WHITE"
                SIZE="H4"
                FONT="FIRM"
                key={image.path + "-title"}
                variants={textVariants}
              >
                {image.title}
              </Text>
            </AnimatePresence>
          </Flex>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HeroPageImage;
