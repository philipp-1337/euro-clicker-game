import { useModal } from '../../hooks/useModal';
import {
  X as CloseIcon,
  // Power as PowerIcon,
  // PowerOff as PowerOffIcon,
  Euro as EuroIcon,
  Clock as ClockIcon,
  PiggyBank as PiggyBankIcon,
  TimerReset,
  TrendingUp,
  Percent
} from 'lucide-react';

const AutoBuyerModal = ({
  show,
  onClose,
  autoBuyerInterval,
  setAutoBuyerInterval,
  autoBuyerBuffer,
  setAutoBuyerBuffer,
  formatNumber,
  autoBuyValueUpgradeEnabled,
  setAutoBuyValueUpgradeEnabled,
  autoBuyCooldownUpgradeEnabled,
  setAutoBuyCooldownUpgradeEnabled,
  autoBuyerUnlocked,
  cooldownAutoBuyerUnlocked,
  autoBuyGlobalMultiplierEnabled,
  setAutoBuyGlobalMultiplierEnabled,
  globalMultiplierAutoBuyerUnlocked,
  autoBuyGlobalPriceDecreaseEnabled,
  setAutoBuyGlobalPriceDecreaseEnabled,
  globalPriceDecreaseAutoBuyerUnlocked,
}) => {
  const modalRef = useModal(show, onClose);

  if (!show) return null;

  const handleIntervalChange = (e) => {
    setAutoBuyerInterval(Number(e.target.value));
  };

  const handleBufferChange = (e) => {
    const sliderValue = Number(e.target.value);
    if (sliderValue === 0) {
      setAutoBuyerBuffer(0);
      return;
    }
    const maxExponent = 18; // for 10^18
    const exponent = (sliderValue / 100) * maxExponent;
    const value = Math.pow(10, exponent);
    setAutoBuyerBuffer(value);
  };

  const getSliderValue = (buffer) => {
    if (buffer <= 0) {
      return 0;
    }
    const maxExponent = 18;
    const exponent = Math.log10(buffer);
    const sliderValue = (exponent / maxExponent) * 100;
    return Math.min(Math.max(sliderValue, 0), 100);
  };

  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="modal-content autobuyer-modal">
        <div className="settings-modal-header">
          <h3>Automation Settings</h3>
          <button
            className="settings-button"
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="settings-modal-content">
          {autoBuyerUnlocked && (
              <div className="settings-row">
                <div className="settings-row-left">
                  <EuroIcon size={20} className="settings-icon" />
                  <span className="switch-text">Value Auto-Buyer</span>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    className="switch"
                    checked={autoBuyValueUpgradeEnabled}
                    onChange={() => setAutoBuyValueUpgradeEnabled((v) => !v)}
                    aria-label="Value Auto-Buyer"
                  />
                  <span className="switch-slider" />
                </label>
              </div>
          )}

          {cooldownAutoBuyerUnlocked && (
              <div className="settings-row">
                <div className="settings-row-left">
                  <ClockIcon size={20} className="settings-icon" />
                  <span className="switch-text">Cooldown Auto-Buyer</span>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    className="switch"
                    checked={autoBuyCooldownUpgradeEnabled}
                    onChange={() => setAutoBuyCooldownUpgradeEnabled((v) => !v)}
                    aria-label="Cooldown Auto-Buyer"
                  />
                  <span className="switch-slider" />
                </label>
              </div>
          )}

          {globalMultiplierAutoBuyerUnlocked && (
              <div className="settings-row">
                <div className="settings-row-left">
                  <TrendingUp size={20} className="settings-icon" />
                  <span className="switch-text">Multiplier Auto-Buyer</span>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    className="switch"
                    checked={autoBuyGlobalMultiplierEnabled}
                    onChange={() => setAutoBuyGlobalMultiplierEnabled((v) => !v)}
                    aria-label="Multiplier Auto-Buyer"
                  />
                  <span className="switch-slider" />
                </label>
              </div>
          )}

          {globalPriceDecreaseAutoBuyerUnlocked && (
              <div className="settings-row">
                <div className="settings-row-left">
                  <Percent size={20} className="settings-icon" />
                  <span className="switch-text">Discount Auto-Buyer</span>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    className="switch"
                    checked={autoBuyGlobalPriceDecreaseEnabled}
                    onChange={() => setAutoBuyGlobalPriceDecreaseEnabled((v) => !v)}
                    aria-label="Discount Auto-Buyer"
                  />
                  <span className="switch-slider" />
                </label>
              </div>
          )}

          <hr />

          <div className="settings-row">
            <TimerReset size={24} className="settings-icon" />
            <div className="settings-label-group">
              <label htmlFor="autoBuyerInterval" className="settings-label">
                Purchase Interval: {autoBuyerInterval / 1000}s
            </label>
            <input
              type="range"
                id="autoBuyerInterval"
                min="500"
                max="5000"
                step="500"
              value={autoBuyerInterval}
              onChange={handleIntervalChange}
              className="settings-slider"
            />
            </div>
          </div>

          <div className="settings-row">
            <PiggyBankIcon size={24} className="settings-icon" />
            <div className="settings-label-group">
              <label htmlFor="autoBuyerBuffer" className="settings-label">
                Money Buffer: {formatNumber(autoBuyerBuffer)}
            </label>
            <input
              type="range"
                id="autoBuyerBuffer"
                min="0"
                max="100"
                step="0.1"
              value={getSliderValue(autoBuyerBuffer)}
              onChange={handleBufferChange}
              className="settings-slider"
            />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoBuyerModal;