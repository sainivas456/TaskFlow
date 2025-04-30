
import React from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, alt, width, height, ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={cn('max-w-full h-auto', className)}
        alt={alt || 'Image'}
        width={width}
        height={height}
        {...props}
      />
    );
  }
);

Image.displayName = 'Image';

export default Image;
