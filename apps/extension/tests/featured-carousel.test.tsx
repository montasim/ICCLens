import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

import type { CatalogItem } from '../src/domain/icc-page'
import { FeaturedCarousel } from '../src/features/icc-lens/featured-carousel'

const featuredItems: CatalogItem[] = Array.from({ length: 6 }, (_, index) => ({
  id: `featured-${index + 1}`,
  title: `Featured title ${index + 1}`,
  href: `http://10.16.100.244/player.php?play=featured-${index + 1}`,
  imageHref: null,
  age: 'Recently added',
  hits: null,
  action: 'details',
}))

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function mockMotionPreference(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  )
}

describe('FeaturedCarousel', () => {
  it('automatically advances to the next gallery page', () => {
    vi.useFakeTimers()
    mockMotionPreference(false)

    render(<FeaturedCarousel items={featuredItems} />)

    expect(
      screen.getByRole('button', { name: 'Go to featured page 1' }),
    ).toHaveAttribute('aria-current', 'true')

    act(() => vi.advanceTimersByTime(5_000))

    expect(
      screen.getByRole('button', { name: 'Go to featured page 2' }),
    ).toHaveAttribute('aria-current', 'true')
  })

  it('pauses while the user interacts and resumes when they leave', () => {
    vi.useFakeTimers()
    mockMotionPreference(false)

    render(<FeaturedCarousel items={featuredItems} />)
    const carousel = screen.getByRole('region', { name: 'Featured on ICC' })

    fireEvent.mouseEnter(carousel)
    act(() => vi.advanceTimersByTime(5_000))
    expect(
      screen.getByRole('button', { name: 'Go to featured page 1' }),
    ).toHaveAttribute('aria-current', 'true')

    fireEvent.mouseLeave(carousel)
    act(() => vi.advanceTimersByTime(5_000))
    expect(
      screen.getByRole('button', { name: 'Go to featured page 2' }),
    ).toHaveAttribute('aria-current', 'true')
  })

  it('lets the user pause and resume automatic scrolling', () => {
    vi.useFakeTimers()
    mockMotionPreference(false)

    render(<FeaturedCarousel items={featuredItems} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Pause automatic featured scrolling',
      }),
    )

    act(() => vi.advanceTimersByTime(5_000))
    expect(
      screen.getByRole('button', { name: 'Go to featured page 1' }),
    ).toHaveAttribute('aria-current', 'true')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Resume automatic featured scrolling',
      }),
    )
    act(() => vi.advanceTimersByTime(5_000))
    expect(
      screen.getByRole('button', { name: 'Go to featured page 2' }),
    ).toHaveAttribute('aria-current', 'true')
  })

  it('does not auto-advance when reduced motion is requested', () => {
    vi.useFakeTimers()
    mockMotionPreference(true)

    render(<FeaturedCarousel items={featuredItems} />)
    act(() => vi.advanceTimersByTime(10_000))

    expect(
      screen.getByRole('button', { name: 'Go to featured page 1' }),
    ).toHaveAttribute('aria-current', 'true')
  })
})
