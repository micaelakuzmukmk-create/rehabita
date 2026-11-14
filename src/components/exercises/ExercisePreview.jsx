import React from 'react';
import { Image } from '@/components/ui/image';
import { resolveExerciseAnimation } from '@/lib/exerciseAnimations';
import AnimationPlaceholder from './AnimationPlaceholder';
import { cn } from '@/lib/utils';

/**
 * Vista previa estática de un ejercicio: solo la portada (frame inicial), sin
 * video, sin autoplay y sin loop. La animación se reproduce recién dentro del
 * ejercicio abierto (ExerciseAnimation).
 */
export default function ExercisePreview({
  name,
  gender = 'mujer',
  fitting = 'cover',
  compact = false,
  className,
}) {
  const asset = resolveExerciseAnimation(name, gender);

  if (!asset.poster) {
    return <AnimationPlaceholder compact={compact} className={className} />;
  }

  return (
    <Image
      src={asset.poster}
      alt={`Posición inicial de ${name}`}
      fittingType={fitting === 'cover' ? 'fill' : 'fit'}
      className={cn('h-full w-full', fitting === 'cover' ? 'object-cover' : 'object-contain', className)}
    />
  );
}