import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Vocabulary = {
  id: number;
  word: string;
  part_of_speech: string;
  chinese: string;
  accuracy: number;
  discovered: boolean;
};

type VocabularyListProps = {
  sectionId: number;
  chapterTitle: string;
};

export function VocabularyList({ sectionId, chapterTitle }: VocabularyListProps) {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVocabularies() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('vocabulary') // Replace with your Supabase view name
          .select('*')
          .eq('section_id', sectionId)
          .order('id');

        if (error) throw error;

        setVocabularies(data as Vocabulary[]);
      } catch (err) {
        console.error('Error fetching vocabularies:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVocabularies();
  }, [sectionId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">{chapterTitle} - 單字清單</h1>
      <ul className="space-y-2">
        {vocabularies.map((vocabulary) => (
          <li key={vocabulary.id} className="bg-stone-800 p-4 rounded-lg">
            <h2 className="text-xl text-amber-500">
              {vocabulary.discovered ? vocabulary.word : '???'}
            </h2>
            <p className="text-stone-400">
              詞性: {vocabulary.discovered ? vocabulary.part_of_speech : '???'}
            </p>
            <p className="text-stone-400">
              中文: {vocabulary.discovered ? vocabulary.chinese : '???'}
            </p>
            <p className="text-stone-400">正確率: {vocabulary.accuracy}%</p>
          </li>
        ))}
      </ul>
    </div>
  );
}