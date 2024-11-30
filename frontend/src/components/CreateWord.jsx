import React, { useState } from 'react';
import axios from 'axios';
import { VStack, Button, Input, Heading, Flex } from '@chakra-ui/react';

const CreateWord = () => {
    const [newWord, setNewWord] = useState('');

    const handleCreateUserWord = async () => {
        if (newWord.trim()) {
            try {
                await axios.post('http://localhost:5000/api/userWords', {
                    word: newWord,
                    associatedWords: []
                });
                setNewWord(''); // Clear the input after creation
                console.log("Word created successfully");
            } catch (error) {
                console.error("Error creating word:", error);
            }
        }
    };

    return (
        <VStack spacing={4} width="100%" alignItems="center">
            <Flex width={['100%', '70%', '50%']} alignItems="center">
                <Input
                    placeholder="Enter a new word"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    size="md"
                    flex="1"
                    mr="3"
                    color="#2A2F33"  /* Sets the input text color to white */
                    _placeholder={{ color: "#FFFFFF" }}  /* Sets the placeholder color to white */
                    borderWidth="2px"
                    borderColor="gray.400"
                />
                <Button 
                    onClick={handleCreateUserWord} 
                    colorScheme="blue"
                    px="6"
                >
                    Store
                </Button>
            </Flex>
        </VStack>
    );    
};

export default CreateWord;
