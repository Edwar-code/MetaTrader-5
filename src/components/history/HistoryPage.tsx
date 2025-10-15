
'use client';

import { useMemo, useState } from 'react';
import HistorySummary from './HistorySummary';
import BottomNav from '../trade/BottomNav';
import HistoryHeader from './HistoryHeader';
import HistoryList from './HistoryList';
import { useTradeContext } from '@/context/TradeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ClosedPosition } from '@/lib/types';
import { format } from 'date-fns-tz';

// Helper to convert Unix timestamp (seconds) to 'yyyy-MM-ddTHH:mm' format
const formatEpochToDateTimeLocal = (epoch: number): string => {
    if (!epoch) return '';
    const date = new Date(epoch * 1000);
    // Adjust for local timezone offset before formatting
    const timeZoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() - timeZoneOffset);
    return adjustedDate.toISOString().slice(0, 16);
};

export default function HistoryPage() {
  const { closedPositions, balance: contextBalance, handleUpdateHistoryItem } = useTradeContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [positionToEdit, setPositionToEdit] = useState<ClosedPosition | null>(null);
  const [editFormState, setEditFormState] = useState<Partial<ClosedPosition>>({});
  
  // States for editing summary values
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [customProfit, setCustomProfit] = useState<number | null>(null);
  const [profitInput, setProfitInput] = useState('');
  
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [customDeposit, setCustomDeposit] = useState<number>(100.00);
  const [depositInput, setDepositInput] = useState('');


  const calculatedTotalProfit = useMemo(() => {
    return closedPositions.reduce((acc, pos) => acc + pos.pnl, 0);
  }, [closedPositions]);
  
  const displayProfit = customProfit !== null ? customProfit : calculatedTotalProfit;
  
  const historySummary = useMemo(() => {
    const newBalance = customDeposit + displayProfit;

    return {
      profit: displayProfit.toFixed(2),
      deposit: customDeposit.toFixed(2),
      swap: '0.00',
      commission: '0.00',
      balance: newBalance.toFixed(2),
    };
  }, [displayProfit, customDeposit]);
  
  const displayDate = '2025.09.06 14:56:57';

  const handleLongPress = (position: ClosedPosition) => {
    setPositionToEdit(position);
    setEditFormState(position);
    setIsEditModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number;

    if (name === 'closeTime') {
        processedValue = new Date(value).getTime() / 1000;
    } else if (['size', 'entryPrice', 'closePrice', 'pnl'].includes(name)) {
        processedValue = parseFloat(value) || 0;
    } else {
        processedValue = value;
    }

    setEditFormState(prev => ({
        ...prev,
        [name]: processedValue,
    }));
  };

  const handleSaveChanges = () => {
    if (positionToEdit && handleUpdateHistoryItem) {
        handleUpdateHistoryItem(positionToEdit.id, editFormState);
    }
    setIsEditModalOpen(false);
    setPositionToEdit(null);
  };
  
  const handleEditProfitClick = () => {
    setProfitInput(displayProfit.toFixed(2));
    setIsProfitModalOpen(true);
  };

  const handleSaveProfit = () => {
    const newProfit = parseFloat(profitInput);
    if (!isNaN(newProfit)) {
        setCustomProfit(newProfit);
    }
    setIsProfitModalOpen(false);
  };

  const handleEditDepositClick = () => {
    setDepositInput(customDeposit.toFixed(2));
    setIsDepositModalOpen(true);
  };

  const handleSaveDeposit = () => {
    const newDeposit = parseFloat(depositInput);
    if (!isNaN(newDeposit)) {
        setCustomDeposit(newDeposit);
    }
    setIsDepositModalOpen(false);
  };


  return (
    <>
    <div className="relative flex flex-col h-[100svh] w-full bg-card shadow-lg overflow-hidden">
      <HistoryHeader />
      <div className="flex-1 overflow-y-auto pb-24">
        <div>
           <div className="flex items-center">
             <span className="flex-1 text-center text-foreground border-b-2 border-primary py-3" style={{ fontSize: '13px' }}>POSITIONS</span>
             <span className="flex-1 text-center py-3" style={{ fontSize: '13px', color: '#6a7684' }}>ORDERS</span>
             <span className="flex-1 text-center py-3" style={{ fontSize: '13px', color: '#6a7684' }}>DEALS</span>
           </div>
        </div>
        <HistorySummary 
            data={historySummary} 
            onEditProfit={handleEditProfitClick}
            onEditDeposit={handleEditDepositClick}
        />
        
        <div className="px-4 py-[1.7px] border-t border-b bg-background">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] text-muted-foreground font-semibold">Balance</span>
               <div className="flex items-center text-[13.5px] text-muted-foreground">
                 <span>{displayDate}</span>
               </div>
            </div>
            <div className="text-right">
                 <span className="text-[13.5px] font-bold text-primary">
                    {historySummary.balance}
                </span>
            </div>
        </div>

        {closedPositions.length > 0 ? (
          <HistoryList positions={closedPositions} onItemLongPress={handleLongPress} />
        ) : (
          <div className="text-center p-8 text-muted-foreground">
              No history yet. Closed trades will appear here.
          </div>
        )}
      </div>
      <BottomNav />
    </div>

    {/* Dialog for editing individual history items */}
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit History Item</DialogTitle>
                <DialogDescription>
                    Adjust the details of this closed trade. Changes will affect summary calculations.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pair" className="text-right">Pair</Label>
                    <Input id="pair" name="pair" value={editFormState.pair || ''} onChange={handleFormChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Input id="type" name="type" value={editFormState.type || ''} onChange={handleFormChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="size" className="text-right">Size</Label>
                    <Input id="size" name="size" type="number" value={editFormState.size || ''} onChange={handleFormChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="entryPrice" className="text-right">Entry Price</Label>
                    <Input id="entryPrice" name="entryPrice" type="number" value={editFormState.entryPrice || ''} onChange={handleFormChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="closePrice" className="text-right">Close Price</Label>
                    <Input id="closePrice" name="closePrice" type="number" value={editFormState.closePrice || ''} onChange={handleFormChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pnl" className="text-right">Profit/Loss</Label>
                    <Input id="pnl" name="pnl" type="number" value={editFormState.pnl || ''} onChange={handleFormChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="closeTime" className="text-right">Close Time</Label>
                    <Input 
                      id="closeTime" 
                      name="closeTime" 
                      type="datetime-local" 
                      value={formatEpochToDateTimeLocal(editFormState.closeTime || 0)} 
                      onChange={handleFormChange} 
                      className="col-span-3" 
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for editing total profit */}
      <Dialog open={isProfitModalOpen} onOpenChange={setIsProfitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Total Profit</DialogTitle>
            <DialogDescription>
              Set a custom total profit. This will override the calculated value from individual trades.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profit" className="text-right">
                Total Profit
              </Label>
              <Input
                id="profit"
                type="number"
                value={profitInput}
                onChange={(e) => setProfitInput(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfitModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing deposit */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deposit</DialogTitle>
            <DialogDescription>
              Set the initial deposit amount for this account history.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deposit" className="text-right">
                Deposit
              </Label>
              <Input
                id="deposit"
                type="number"
                value={depositInput}
                onChange={(e) => setDepositInput(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDeposit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
