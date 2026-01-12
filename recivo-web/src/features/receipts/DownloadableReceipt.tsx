interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Receipt {
  businessName: string;
  businessAddress: string;
  businessContact: string;
  customerName?: string;
  customerContact?: string;
  items: LineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  receiptNumber: string;
  date: string;
}

interface DownloadableReceiptProps {
  receipt: Receipt;
  cashierName: string;
  footerMessage?: string;
  formatCurrency: (amount: number) => string;
}

export const DownloadableReceipt = ({
  receipt,
  cashierName,
  footerMessage,
  formatCurrency,
}: DownloadableReceiptProps) => {
  return (
    <div 
      style={{ 
        backgroundColor: '#FFFFFF',
        padding: '2rem',
        width: '480px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Business Info */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #D1D5DB'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          color: '#111827',
          letterSpacing: '0.025em',
          margin: '0 0 0.5rem 0'
        }}>
          {receipt.businessName}
        </h2>
        <p style={{ 
          fontSize: '0.875rem',
          color: '#4B5563',
          lineHeight: '1.5',
          margin: '0.25rem 0'
        }}>
          {receipt.businessAddress}
        </p>
        {receipt.businessContact && (
          <p style={{ 
            fontSize: '0.875rem',
            color: '#4B5563',
            margin: '0.25rem 0'
          }}>
            {receipt.businessContact}
          </p>
        )}
      </div>

      {/* Receipt Details */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '0.875rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ color: '#4B5563' }}>Receipt #:</span>
          <span style={{ 
            fontFamily: 'monospace',
            fontWeight: '600',
            color: '#111827'
          }}>
            {receipt.receiptNumber}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '0.875rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ color: '#4B5563' }}>Date:</span>
          <span style={{ fontWeight: '600', color: '#111827' }}>{receipt.date}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '0.875rem'
        }}>
          <span style={{ color: '#4B5563' }}>Cashier:</span>
          <span style={{ fontWeight: '600', color: '#111827' }}>{cashierName}</span>
        </div>
      </div>

      {/* Customer Info */}
      {(receipt.customerName || receipt.customerContact) && (
        <div style={{ 
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #D1D5DB'
        }}>
          <p style={{ 
            fontSize: '0.75rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            color: '#374151',
            letterSpacing: '0.05em',
            margin: '0 0 0.5rem 0'
          }}>
            CUSTOMER:
          </p>
          {receipt.customerName && (
            <p style={{ 
              fontSize: '0.875rem',
              color: '#111827',
              margin: '0.25rem 0'
            }}>
              {receipt.customerName}
            </p>
          )}
          {receipt.customerContact && (
            <p style={{ 
              fontSize: '0.875rem',
              color: '#4B5563',
              margin: '0.25rem 0'
            }}>
              {receipt.customerContact}
            </p>
          )}
        </div>
      )}

      {/* Items Table */}
      <div style={{ 
        borderBottom: '2px solid #D1D5DB',
        paddingBottom: '1rem',
        marginBottom: '1.25rem'
      }}>
        <table style={{ 
          width: '100%', 
          fontSize: '0.875rem',
          borderCollapse: 'collapse',
          tableLayout: 'fixed'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
              <th style={{ 
                textAlign: 'left',
                padding: '0.5rem 0.25rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#374151',
                letterSpacing: '0.05em',
                width: '45%'
              }}>
                ITEM
              </th>
              <th style={{ 
                textAlign: 'center',
                padding: '0.5rem 0.25rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#374151',
                letterSpacing: '0.05em',
                width: '12%'
              }}>
                QTY
              </th>
              <th style={{ 
                textAlign: 'right',
                padding: '0.5rem 0.25rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#374151',
                letterSpacing: '0.05em',
                width: '21%'
              }}>
                PRICE
              </th>
              <th style={{ 
                textAlign: 'right',
                padding: '0.5rem 0.25rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#374151',
                letterSpacing: '0.05em',
                width: '22%'
              }}>
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={item.id} style={{ 
                borderBottom: index < receipt.items.length - 1 ? '1px solid #F3F4F6' : 'none'
              }}>
                <td style={{ 
                  padding: '0.75rem 0.25rem',
                  color: '#111827',
                  wordBreak: 'break-word',
                  lineHeight: '1.4'
                }}>
                  {item.name}
                </td>
                <td style={{ 
                  padding: '0.75rem 0.25rem',
                  textAlign: 'center',
                  color: '#374151',
                  fontWeight: '500'
                }}>
                  {item.quantity}
                </td>
                <td style={{ 
                  padding: '0.75rem 0.25rem',
                  textAlign: 'right',
                  color: '#374151'
                }}>
                  {formatCurrency(item.unitPrice)}
                </td>
                <td style={{ 
                  padding: '0.75rem 0.25rem',
                  textAlign: 'right',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ 
        marginBottom: '1.25rem',
        fontSize: '0.875rem'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <span style={{ color: '#4B5563' }}>Subtotal:</span>
          <span style={{ fontWeight: '600', color: '#111827' }}>
            {formatCurrency(receipt.subtotal)}
          </span>
        </div>
        {receipt.discount > 0 && (
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <span style={{ color: '#4B5563' }}>Discount:</span>
            <span style={{ fontWeight: '600', color: '#DC2626' }}>
              -{formatCurrency(receipt.discount)}
            </span>
          </div>
        )}
        {receipt.tax > 0 && (
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <span style={{ color: '#4B5563' }}>Tax:</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>
              +{formatCurrency(receipt.tax)}
            </span>
          </div>
        )}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '2px solid #D1D5DB',
          marginTop: '0.5rem'
        }}>
          <span style={{ fontWeight: '700', color: '#111827', fontSize: '1rem' }}>
            TOTAL:
          </span>
          <span style={{ 
            fontWeight: '700',
            fontSize: '1.25rem',
            color: '#111827'
          }}>
            {formatCurrency(receipt.totalAmount)}
          </span>
        </div>
      </div>

      {/* Payment Info */}
      <div style={{ 
        borderTop: '2px solid #D1D5DB',
        paddingTop: '1rem',
        marginBottom: '1rem',
        fontSize: '0.875rem'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <span style={{ color: '#4B5563' }}>Payment Method:</span>
          <span style={{ fontWeight: '600', color: '#111827' }}>
            {receipt.paymentMethod}
          </span>
        </div>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <span style={{ color: '#4B5563' }}>Amount Paid:</span>
          <span style={{ fontWeight: '600', color: '#111827' }}>
            {formatCurrency(receipt.amountPaid)}
          </span>
        </div>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#4B5563' }}>Change:</span>
          <span style={{ fontWeight: '700', color: '#059669', fontSize: '1rem' }}>
            {formatCurrency(receipt.change)}
          </span>
        </div>
      </div>

      {/* Footer Message */}
      {footerMessage && (
        <div style={{ 
          textAlign: 'center',
          paddingTop: '1rem',
          borderTop: '2px solid #D1D5DB'
        }}>
          <p style={{ 
            fontSize: '0.875rem',
            fontStyle: 'italic',
            color: '#6B7280',
            lineHeight: '1.5',
            margin: 0
          }}>
            {footerMessage}
          </p>
        </div>
      )}
    </div>
  );
};