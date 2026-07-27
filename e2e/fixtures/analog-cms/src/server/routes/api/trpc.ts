export default function defineEventHandler(event) {
  return {
    hello: 'world from tRPC',
    posts: [
      { id: 1, title: 'Hello Analog' },
      { id: 2, title: 'Lunx Build Integration' }
    ]
  };
}
