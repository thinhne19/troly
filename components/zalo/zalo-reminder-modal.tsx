'use client';

// components/zalo/zalo-reminder-modal.tsx — Zalo Notification Generator (4 Polish Templates)
import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Invoice, Tenant, Lease } from '@/types/models';
import { formatVND } from '@/lib/utils';
import { generateVietQrUrl } from '@/lib/vietqr';
import {
  MessageSquare,
  Copy,
  ExternalLink,
  Check,
  Send,
  FileText,
  AlertCircle,
  Receipt,
  CalendarCheck,
} from 'lucide-react';

export type ZaloTemplateType = 'new_invoice' | 'debt_reminder' | 'payment_receipt' | 'lease_renewal';

interface ZaloReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
  tenant?: Tenant | null;
  lease?: Lease | null;
  initialTemplate?: ZaloTemplateType;
}

export function ZaloReminderModal({
  isOpen,
  onClose,
  invoice,
  tenant: propTenant,
  lease: propLease,
  initialTemplate = 'new_invoice',
}: ZaloReminderModalProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<ZaloTemplateType>(initialTemplate);
  const [copied, setCopied] = React.useState(false);
  const [customMessage, setCustomMessage] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);

  const activeTenant = invoice?.tenant || propTenant;
  const activeLease = invoice?.lease || propLease;
  const roomCode = invoice?.room?.roomCode || activeLease?.room?.roomCode || 'P.101';
  const tenantName = activeTenant?.fullName || 'Quý khách';
  const tenantPhone = activeTenant?.phone?.replace(/[^0-9]/g, '') || '';
  const month = invoice?.billingMonth || '2026-09';
  const dueDate = invoice?.dueDate || `${month}-05`;

  // Calculate overdue days
  const today = new Date();
  const due = invoice?.dueDate ? new Date(invoice.dueDate) : today;
  const overdueDays = Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));

  const memo = invoice?.vietqrPayload || `TROLY-${roomCode.replace(/[^A-Z0-9]/gi, '')}-${month.replace('-', '')}`;
  const qrUrl = generateVietQrUrl({
    bankId: 'MB',
    accountNo: '999908123456',
    accountName: 'NGUYEN VAN THIN',
    amount: invoice?.balanceDue || invoice?.totalAmount || 0,
    memo,
  });

  // Calculate item breakdown
  const rentItem = invoice?.items?.find((i) => i.itemType === 'rent')?.amount || 0;
  const elecItem = invoice?.items?.find((i) => i.itemType === 'electricity');
  const elecAmount = elecItem?.amount || 0;
  const elecUsage = elecItem?.quantity || 0;
  const waterAmount = invoice?.items?.find((i) => i.itemType === 'water')?.amount || 0;
  const serviceAmount =
    (invoice?.items || [])
      .filter((i) => i.itemType !== 'rent' && i.itemType !== 'electricity' && i.itemType !== 'water')
      .reduce((acc, i) => acc + i.amount, 0);

  // Default Template Messages
  const templates: Record<ZaloTemplateType, { title: string; icon: React.ReactNode; text: string }> = {
    new_invoice: {
      title: 'Hóa đơn mới',
      icon: <FileText className="w-4 h-4 text-emerald-600" />,
      text: `[TROLY] THÔNG BÁO TIỀN PHÒNG THÁNG ${month}
Kính gửi anh/chị ${tenantName} (${roomCode}),
Chủ nhà xin gửi thông báo tiền phòng kỳ tháng ${month}:

• Tiền phòng: ${formatVND(rentItem || invoice?.totalAmount || 0)}
• Tiền điện (${elecUsage} kWh): ${formatVND(elecAmount)}
• Tiền nước: ${formatVND(waterAmount)}
• Dịch vụ & rác, wifi: ${formatVND(serviceAmount)}
--------------------------------
👉 TỔNG CỘNG: ${formatVND(invoice?.totalAmount || 0)}
📅 Hạn thanh toán: trước ngày ${dueDate}

💳 Thông tin chuyển khoản:
• Ngân hàng: MBBank (Quân Đội)
• STK: 999908123456 (NGUYEN VAN THIN)
• Cú pháp: ${memo}
• Link VietQR tự điền số tiền: ${qrUrl}

Anh/chị vui lòng thanh toán đúng hạn. Xin chân thành cảm ơn!`,
    },
    debt_reminder: {
      title: 'Nhắc nợ quá hạn',
      icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
      text: `[TROLY] NHẮC THANH TOÁN TIỀN PHÒNG QUÁ HẠN
Kính gửi anh/chị ${tenantName} (${roomCode}),
Hóa đơn tiền phòng tháng ${month} (hạn đóng: ${dueDate}) của anh/chị hiện đã quá hạn ${overdueDays > 0 ? overdueDays : 3} ngày.

• Mã hóa đơn: ${invoice?.invoiceCode || 'HD-' + month}
• Số tiền còn nợ: ${formatVND(invoice?.balanceDue || invoice?.totalAmount || 0)}

💳 Chuyển khoản thanh toán:
• STK: 999908123456 - MBBank (NGUYEN VAN THIN)
• Nội dung: ${memo}
• Quét mã VietQR: ${qrUrl}

Mong anh/chị sắp xếp thanh toán sớm trong hôm nay để thuận tiện quản lý phòng. Nếu đã chuyển khoản, xin vui lòng bỏ qua tin nhắn này. Trân trọng cảm ơn!`,
    },
    payment_receipt: {
      title: 'Biên nhận đã thu',
      icon: <Receipt className="w-4 h-4 text-indigo-600" />,
      text: `[TROLY] XÁC NHẬN ĐÃ THU TIỀN PHÒNG
Kính gửi anh/chị ${tenantName} (${roomCode}),
Chủ nhà xác nhận đã nhận được khoản thanh toán cho kỳ ${month}:

• Số tiền nhận: ${formatVND(invoice?.amountPaid || invoice?.totalAmount || 0)}
• Còn lại: ${formatVND(invoice?.balanceDue || 0)}
• Trạng thái: ${invoice?.balanceDue === 0 ? 'ĐÃ HOÀN TẤT THANH TOÁN' : 'THANH TOÁN MỘT PHẦN'}

Cảm ơn anh/chị đã luôn thanh toán đúng hẹn. Chúc anh/chị sinh sống thoải mái!`,
    },
    lease_renewal: {
      title: 'Nhắc gia hạn HĐ',
      icon: <CalendarCheck className="w-4 h-4 text-primary" />,
      text: `[TROLY] THÔNG BÁO HẾT HẠN HỢP ĐỒNG THUÊ PHÒNG
Kính gửi anh/chị ${tenantName} (${roomCode}),
Hợp đồng thuê phòng của anh/chị sắp đến hạn kết thúc vào ngày ${activeLease?.endDate || '30 ngày tới'}.

Chủ nhà gửi thông báo để anh/chị chủ động kế hoạch:
1. Ký gia hạn thêm hợp đồng (6 tháng / 1 năm) để tiếp tục lưu trú ổn định.
2. Hoặc bàn giao lại phòng và nhận lại tiền cọc (${formatVND(activeLease?.depositAmount || 0)}) theo hợp đồng.

Anh/chị vui lòng phản hồi lại tin nhắn này trước ngày 15 để bên mình kịp sắp xếp nhé. Xin cảm ơn anh/chị!`,
    },
  };

  // Sync template text when selection changes
  React.useEffect(() => {
    setSelectedTemplate(initialTemplate);
    setCustomMessage(templates[initialTemplate].text);
    setIsEditing(false);
  }, [initialTemplate, invoice?.id]);

  const handleSelectTemplate = (type: ZaloTemplateType) => {
    setSelectedTemplate(type);
    setCustomMessage(templates[type].text);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleOpenZalo = () => {
    // If phone starts with 0, convert to international or open direct web zalo
    let formattedPhone = tenantPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `84${formattedPhone.slice(1)}`;
    }
    const encodedText = encodeURIComponent(customMessage);
    const zaloUrl = formattedPhone
      ? `https://zalo.me/${formattedPhone}?text=${encodedText}`
      : `https://chat.zalo.me/`;
    window.open(zaloUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gửi thông báo & nhắc nợ qua Zalo"
      description={`Khách thuê: ${tenantName} • SĐT: ${activeTenant?.phone || 'Chưa có'} • Phòng: ${roomCode}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Template Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(templates) as ZaloTemplateType[]).map((type) => {
            const isSelected = selectedTemplate === type;
            const t = templates[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleSelectTemplate(type)}
                className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.icon}
                <span className="truncate">{t.title}</span>
              </button>
            );
          })}
        </div>

        {/* Message Editor / Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Nội dung tin nhắn ({templates[selectedTemplate].title})</span>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-primary hover:underline"
            >
              {isEditing ? 'Khóa chỉnh sửa' : 'Chỉnh sửa nội dung'}
            </button>
          </div>

          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            readOnly={!isEditing}
            rows={11}
            className={`w-full font-mono text-xs p-3.5 rounded-lg border leading-relaxed outline-none transition-all ${
              isEditing
                ? 'border-primary bg-white text-slate-800 shadow-inner'
                : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span>Mở trực tiếp Zalo Web hoặc App Zalo đã cài</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Đã chép nội dung!' : 'Sao chép tin nhắn'}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleOpenZalo}
              className="flex-1 sm:flex-initial gap-1.5 bg-[#0068FF] hover:bg-[#0055d4] text-white"
            >
              <Send className="w-4 h-4" />
              Mở Zalo nhắn ngay
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
