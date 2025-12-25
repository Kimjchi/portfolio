import { cn } from '@/lib/utils'

interface ProjectProps {
  title: string
  description: string
  image: string
  link: string
  className?: string
}

export default function Project({
  title,
  description,
  image,
  link,
  className,
}: ProjectProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <h2>{title}</h2>
      <p>{description}</p>
      <img src={image} alt={title} className="w-full h-auto" loading="lazy" />
      <a href={link} target="_blank" rel="noopener noreferrer">
        View project
      </a>
    </div>
  )
}
