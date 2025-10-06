import { Flex, Text } from 'uikit;/'

const Header = () => {
  return (
    <Flex fullWidth  end className='top-0 left-0 absolute gap-5'>
        <Text COLOR='WHITE' FONT='REGULAR' SIZE='H4' STYLE='SEMIBOLD'>HOME</Text>
        <Text COLOR='WHITE' FONT='REGULAR' SIZE='H4' STYLE='SEMIBOLD'>NEWS</Text>
        <Text COLOR='WHITE' FONT='REGULAR' SIZE='H4' STYLE='SEMIBOLD'>SHOP</Text>
        <Text COLOR='WHITE' FONT='REGULAR' SIZE='H4' STYLE='SEMIBOLD'>REVIEWS</Text>
    </Flex>
  )
}

export default Header