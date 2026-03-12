import type { MagicWordsData } from '../logic/magicWords/MagicWordsLogic';

const MAGIC_WORDS_ENDPOINT =
  'https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords';

export class ApiClient {
  async fetchMagicWords(): Promise<MagicWordsData> {
    const response = await fetch(MAGIC_WORDS_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Magic Words data: ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as MagicWordsData;
  }
}

