import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabList, Tab } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState('a');
    return (
      <Tabs value={active} onChange={setActive}>
        <TabList>
          <Tab value="a">Cliente</Tab>
          <Tab value="b">Parceiro</Tab>
          <Tab value="c">Dentista</Tab>
          <Tab value="d">Laboratório</Tab>
        </TabList>
      </Tabs>
    );
  },
};
