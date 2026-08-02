import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('exposes dialog semantics and closes with Escape', async () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Editar aluno" description="Atualize os dados" onClose={onClose}>
        <button>Salvar</button>
      </Modal>,
    );

    expect(screen.getByRole('dialog', { name: 'Editar aluno' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes from the backdrop but not from content interaction', () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Confirmação" onClose={onClose}>
        <button>Continuar</button>
      </Modal>,
    );

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Continuar' }));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
