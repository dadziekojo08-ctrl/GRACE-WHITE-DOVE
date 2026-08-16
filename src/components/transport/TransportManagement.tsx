import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TransportRoute, Vehicle } from '../../types';
import {
  Bus,
  MapPin,
  Navigation,
  Phone,
  UserCheck,
  Plus,
  ShieldCheck,
  Clock,
  Compass,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const TransportManagement: React.FC = () => {
  const { vehicles, routes, updateVehicle, addRoute } = useSchool();

  const [activeTab, setActiveTab] = useState<'routes' | 'fleet' | 'gps'>('routes');
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute>(routes[0] || {} as TransportRoute);
  const [simulatedBusStopIndex, setSimulatedBusStopIndex] = useState<number>(1);

  const handleSimulateNextStop = () => {
    setSimulatedBusStopIndex((prev) => (prev + 1) % (selectedRoute.stops?.length || 4));
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Transport & Fleet Management</h2>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              GPS Trip Tracking
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage school buses, drivers, attendants, pickup routes, and live transit monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('gps')}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            Live GPS Tracking
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('routes')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'routes'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Navigation className="w-4 h-4" />
          Transport Routes ({routes.length})
        </button>
        <button
          onClick={() => setActiveTab('fleet')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'fleet'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bus className="w-4 h-4" />
          Vehicle Fleet ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('gps')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'gps'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Live Route Simulator
        </button>
      </div>

      {/* Tab 1: Routes */}
      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((rt) => (
            <div key={rt.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{rt.routeName}</h3>
                  <span className="text-xs text-emerald-700 font-semibold">{rt.vehicleNo}</span>
                </div>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  {rt.studentsAssigned} Students Assigned
                </span>
              </div>

              {/* Driver & Attendant */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Driver:</span>
                  <span className="font-bold text-slate-900">{rt.driverName}</span>
                  <span className="text-slate-500 block font-mono">{rt.driverPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Attendant:</span>
                  <span className="font-bold text-slate-900">{rt.attendantName}</span>
                  <span className="text-slate-500 block font-mono">{rt.attendantPhone}</span>
                </div>
              </div>

              {/* Bus Stops Sequence */}
              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-2">Designated Bus Stops & Timings:</span>
                <div className="space-y-1.5">
                  {(rt.stops || []).map((stop, idx) => {
                    const stopName = typeof stop === 'string' ? stop : stop?.stopName || `Stop ${idx + 1}`;
                    const pickupTime = typeof stop === 'string' ? `07:${15 + idx * 10} AM` : stop?.pickupTime || '07:30 AM';
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50/40 border border-emerald-100">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800">{stopName}</span>
                        </div>
                        <span className="font-mono text-emerald-900 font-bold text-[11px]">{pickupTime}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Vehicle Fleet */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((vh) => (
            <div key={vh.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{vh.vehicleNumber}</h3>
                    <p className="text-xs text-slate-500">{vh.vehicleModel || vh.model || 'School Bus'}</p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {vh.status}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Passenger Capacity:</span>
                  <span className="font-bold font-mono">{vh.capacity} Seats</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Driver in Charge:</span>
                  <span className="font-bold text-slate-800">{vh.driverName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Insurance & Roadworthy Expiry:</span>
                  <span className="font-bold text-emerald-800 font-mono">{vh.insuranceExpiry}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Live GPS Simulator */}
      {activeTab === 'gps' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-['Outfit']">
                Active Transit Simulator: {selectedRoute.routeName} ({selectedRoute.vehicleNo || selectedRoute.vehicleNumber || 'GW-2041-22'})
              </h3>
              <p className="text-xs text-slate-500">Live GPS beacon signal reporting every 5 seconds</p>
            </div>
            <button
              onClick={handleSimulateNextStop}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              Simulate Transit to Next Stop
            </button>
          </div>

          {/* Interactive Route Map Representation */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl relative overflow-hidden border border-slate-800">
            <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                <span className="font-bold text-xs text-emerald-300">GPS SATELLITE TRACKING ACTIVE</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Speed: 42 km/h • Heading: North-West</span>
            </div>

            {/* Route Stops Line */}
            <div className="space-y-4">
              {(selectedRoute?.stops || []).map((stop, idx) => {
                const stopName = typeof stop === 'string' ? stop : stop?.stopName || `Stop ${idx + 1}`;
                const pickupTime = typeof stop === 'string' ? `07:${15 + idx * 10} AM` : stop?.pickupTime || '07:30 AM';
                const isCurrent = idx === simulatedBusStopIndex;
                const isPassed = idx < simulatedBusStopIndex;

                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-amber-400 text-emerald-950 ring-4 ring-amber-400/30 scale-110'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs block text-white">{stopName}</span>
                        <span className="text-[11px] text-slate-400">Scheduled: {pickupTime}</span>
                      </div>
                      {isCurrent && (
                        <span className="bg-amber-400 text-emerald-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Bus className="w-3 h-3" /> Bus Arrived Here
                        </span>
                      )}
                      {isPassed && (
                        <span className="text-emerald-400 font-semibold text-[11px]">Students Boarded</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
