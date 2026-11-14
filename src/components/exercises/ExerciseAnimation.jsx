import React, { useEffect, useRef, useState } from 'react';
import { resolveExerciseAnimation } from '@/lib/exerciseAnimations';
import AnimationPlaceholder from './AnimationPlaceholder';
import { cn } from '@/lib/utils';

/**
 * Reproduce el archivo de animación exacto del ejercicio y la preferencia corporal.
 * Si el recurso no existe (o falla), muestra "Demostración en desarrollo".
 */
export default function ExerciseAnimation({
  name,
  gender = 'mujer',
  playing = true,
  speed = 1,
  restartKey = 0,
  fitting = 'contain',
  compact = false,
  className,
}) {
  const asset = resolveExerciseAnimation(name, gender);
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [asset.url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) video.play().catch(() => {});
    else video.pause();
  }, [playing, asset.url]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = speed;
  }, [speed, asset.url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  }, [restartKey]);

  if (!asset.available || failed) {
    return <AnimationPlaceholder compact={compact} className={className} />;
  }

  return (
    <video
      key={asset.url}
      ref={videoRef}
      src={asset.url}
      className={cn('h-full w-full', fitting === 'cover' ? 'object-cover' : 'object-contain', className)}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-label={`Demostración de ${name} (${asset.gender})`}
      onError={() => setFailed(true)}
    />
  );
}