import React, { useMemo } from 'react';
// import { WalletBalance, ProcessedWalletBalance, Props, getPriority } from './constants'; // Giả sử đã import

// --- 1. BLOCKCHAIN PRIORITY MAPPING (Thay thế Switch-Case) ---
// Tối ưu hóa: Dễ bảo trì, tra cứu O(1)
const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

// --- 2. GET PRIORITY FUNCTION (Di chuyển ra ngoài Component) ---
// Tối ưu hóa: Không tạo lại hàm, sử dụng kiểu string rõ ràng
const getPriority = (blockchain: string): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? -99;

// --- 3. KHẮC PHỤC LỖI THIẾU TRƯỜNG BLOCKCHAIN ---
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Đã thêm trường bị thiếu
}

// --- 4. INTERFACE CHO DỮ LIỆU ĐÃ XỬ LÝ ---
// Tối ưu hóa: Một đối tượng duy nhất chứa tất cả thông tin cần hiển thị
interface ProcessedWalletBalance extends WalletBalance {
  formattedAmount: string;
  usdValue: number;
  priority: number;
}

// Giả định các kiểu dữ liệu và hook không có trong đoạn code này
declare const BoxProps: any;
declare const WalletRow: React.FC<any>;
declare const useWalletBalances: () => WalletBalance[];
declare const usePrices: () => Record<string, number>;

interface Props extends typeof BoxProps {}



const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  // Giả sử useWalletBalances và usePrices là các hook có sẵn
  const balances = useWalletBalances();
  const prices = usePrices();

  // --- 5 & 6. GỘP LOGIC VÀ ĐÚNG DEPENDENCIES ---
  const sortedBalances = useMemo(() => {
    return balances
      .map((balance: WalletBalance): ProcessedWalletBalance => {
        const priority = getPriority(balance.blockchain);
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
        // Khắc phục lỗi toFixed() không tham số
        const formattedAmount = balance.amount.toFixed(2); 

        return {
          ...balance,
          priority,
          usdValue,
          formattedAmount,
        };
      })
      .filter((data: ProcessedWalletBalance) => {
        // Khắc phục lỗi logic lọc (lhsPriority -> priority) và logic đảo ngược (amount > 0)
        return data.priority > -99 && data.amount > 0;
      })
      .sort((lhs: ProcessedWalletBalance, rhs: ProcessedWalletBalance) => {
        // Khắc phục lỗi return/sort không ổn định
        const priorityDiff = rhs.priority - lhs.priority;
        
        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        // Nếu priority bằng nhau, sắp xếp theo tên currency tăng dần (A->Z)
        return lhs.currency.localeCompare(rhs.currency);
      });
  }, [balances, prices]); // Đã thêm 'prices' vì logic USD Value giờ nằm trong useMemo

  const rows = sortedBalances.map((balanceData: ProcessedWalletBalance) => {
    return (
      <WalletRow
        // Khắc phục lỗi sử dụng index làm key
        key={balanceData.currency}
        // className={classes.row} // Giả định classes được định nghĩa
        amount={balanceData.amount}
        usdValue={balanceData.usdValue}
        formattedAmount={balanceData.formattedAmount}
      />
    );
  });

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};