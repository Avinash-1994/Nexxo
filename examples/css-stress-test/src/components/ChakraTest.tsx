import { ChakraProvider, Box, Button, Text } from '@chakra-ui/react';

function ChakraContent() {
    return (
        <Box bg='tomato' w='100%' p={4} color='white' borderRadius='md'>
            <Text fontSize='xl' mb={2}>Chakra UI Test</Text>
            <Button colorScheme='teal'>Chakra Button</Button>
        </Box>
    );
}

export default function ChakraTest() {
    return (
        <ChakraProvider>
            <ChakraContent />
        </ChakraProvider>
    );
}
