import React from 'react';
import { ChakraProvider, Container } from '@chakra-ui/react';
import './App.css';
import GithubTokenProvider from './contexts/GithubTokenProvider';
import Main from './Main';

function App() {
  return (
    <ChakraProvider>
      <GithubTokenProvider>
        <Container maxW="8xl">
          <Main />
        </Container>
      </GithubTokenProvider>
    </ChakraProvider>
  );
}

export default App;
