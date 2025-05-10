'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FlowEditor from '@/components/FlowEditor';
import { FlowProvider } from '@/lib/providers/FlowProvider';

export default function FlowPage() {
  const params = useParams();
  const router = useRouter();
  
  console.log('FlowPage renderizando com ID:', params.id);

  return (
    <FlowProvider>
      <FlowEditor flowId={params.id as string} />
    </FlowProvider>
  );
} 