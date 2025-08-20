# @luminex/use-action-mutation

Tiny hook around React 19's `useActionState` for ergonomic server-action "mutations".

## Install

```bash
npm i @luminex/use-action-mutation
```

## Quick Start

```ts
'use client';
import { useActionMutation } from '@luminex/use-action-mutation';
import { myAction } from './actions';

const { mutate, isPending, data } = useActionMutation(myAction, {
  onSuccess: (s) => console.log('ok', s.response),
  onError: (s, e) => console.error(e),
});
```

## API

- `useActionMutation(action, { initialState, onSuccess, onError })`

- `envelopeServerAction(() => Promise<T>) → { success, response? , error? }`

- `ServerActionState<T>`

--- 

