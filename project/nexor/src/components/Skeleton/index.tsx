import * as S from './styles';

type SkeletonLineProps = {
  width?: string;
  height?: string;
};

type SkeletonBlockProps = {
  height?: string;
};

type SkeletonCardProps = {
  lines?: number;
  blockHeight?: string;
};

type SkeletonGridProps = {
  cards?: number;
  minCardWidth?: string;
};

type SkeletonTableProps = {
  rows?: number;
  columns?: number;
};

export function SkeletonLine({ width, height }: SkeletonLineProps) {
  return <S.Line $width={width} $height={height} />;
}

export function SkeletonBlock({ height }: SkeletonBlockProps) {
  return <S.Block $height={height} />;
}

export function SkeletonCard({ lines = 3, blockHeight }: SkeletonCardProps) {
  return (
    <S.Card>
      <SkeletonLine width="38%" />
      {blockHeight ? <SkeletonBlock height={blockHeight} /> : null}
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine key={index} width={index % 2 === 0 ? '82%' : '62%'} />
      ))}
    </S.Card>
  );
}

export function SkeletonGrid({ cards = 3, minCardWidth = '180px' }: SkeletonGridProps) {
  return (
    <S.Grid $minCardWidth={minCardWidth}>
      {Array.from({ length: cards }).map((_, index) => (
        <SkeletonCard key={index} lines={2} blockHeight="34px" />
      ))}
    </S.Grid>
  );
}

export function SkeletonTable({ rows = 4, columns = 4 }: SkeletonTableProps) {
  return (
    <S.Table aria-label="Carregando dados">
      <S.TableHeader $columns={columns}>
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonLine key={index} width={index === 0 ? '60%' : '46%'} />
        ))}
      </S.TableHeader>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <S.TableRow key={rowIndex} $columns={columns}>
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <SkeletonLine key={columnIndex} width={columnIndex === 0 ? '74%' : '54%'} />
          ))}
        </S.TableRow>
      ))}
    </S.Table>
  );
}

export function SkeletonPage() {
  return (
    <S.Stack aria-label="Carregando informações">
      <SkeletonCard lines={2} />
      <SkeletonGrid />
      <SkeletonTable />
    </S.Stack>
  );
}
