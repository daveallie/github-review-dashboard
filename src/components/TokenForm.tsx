import React, { useCallback, useEffect, useState } from 'react';
import { useGithubToken } from '../contexts/GithubTokenProvider';
import {
  Button,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Link,
  ListItem,
  OrderedList,
  Stack,
} from '@chakra-ui/react';

export default function TokenForm() {
  const tokenContext = useGithubToken();
  const [localToken, setLocalToken] = useState(tokenContext.token);

  useEffect(() => {
    if (tokenContext.token) {
      setLocalToken(tokenContext.token);
    }
  }, [tokenContext.token]);

  const saveToken = useCallback(() => {
    if (tokenContext.token !== localToken) {
      tokenContext.setToken(localToken);
    }
  }, [localToken, tokenContext]);

  return (
    <Stack gap={4} mt={4}>
      <div>
        <FormControl>
          <FormLabel>Token</FormLabel>
          <Input
            value={localToken}
            onChange={(event) => setLocalToken(event.target.value)}
          />
          <FormHelperText>
            Head to{' '}
            <Link href="https://github.com/settings/personal-access-tokens/new">
              GitHub
            </Link>{' '}
            to generate a token.
          </FormHelperText>
        </FormControl>
        <Button mt={4} colorScheme="teal" onClick={saveToken}>
          Save
        </Button>
      </div>
      <Divider />
      <Heading size="lg">Guide</Heading>
      <Container>
        <OrderedList>
          <ListItem>
            Head to{' '}
            <Link href="https://github.com/settings/personal-access-tokens/new">
              https://github.com/settings/personal-access-tokens/new
            </Link>
          </ListItem>
          <ListItem>Give the token a name and expiration</ListItem>
          <ListItem>
            Select the resource owner and specific repositories
          </ListItem>
          <ListItem>
            Under repository permissions, grant <b>read-only</b> access to{' '}
            <b>Pull requests</b>
          </ListItem>
          <ListItem>
            Click <b>Generate token</b> and copy the token to the input above
          </ListItem>
        </OrderedList>
      </Container>
    </Stack>
  );
}
