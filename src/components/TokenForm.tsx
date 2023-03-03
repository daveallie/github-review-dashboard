import React, { useCallback, useEffect, useState } from 'react';
import { useGithubToken } from '../contexts/GithubTokenProvider';
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Link,
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
  );
}
