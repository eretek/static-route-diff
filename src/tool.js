/*! Eretek Online Araçlar #09 — Statik Route Envanteri Karşılaştırıcı */
ERT.def('09', {
	run: function (v, c) {
		var I = ERT.ip;
		var load = function (text, f) {
			var r = c.csv(text, f, 20000), H = r.head;
			var ip = ERT.csv.col(H, ['prefix', 'network', 'destination', 'hedef', 'ag', 'ziel']), nh = ERT.csv.col(H, ['next_hop', 'nexthop', 'gateway', 'gw', 'next hop']), me = ERT.csv.col(H, ['metric', 'metrik', 'distance', 'ad']), vr = ERT.csv.col(H, ['vrf', 'vrf_name', 'table']);
			if (ip < 0) { throw c.fe(f, 'col', { c: 'prefix' }); }
			if (nh < 0) { throw c.fe(f, 'col', { c: 'next_hop' }); }
			var m = new Map();
			r.rows.forEach(function (row, i) {
				var p = I.parseCidr(row[ip]);
				if (p.err) { throw c.fe(f, 'rowCidr', { r: i + 2, l: row[ip] }); }
				var key = (vr >= 0 && row[vr] ? row[vr] : 'default') + '|' + I.fmt(p.fam, p.net) + '/' + p.len;
				var hop = (row[nh] || '').trim().toLowerCase() + (me >= 0 && row[me] !== '' ? ' [' + row[me] + ']' : '');
				if (!m.has(key)) { m.set(key, new Set()); }
				m.get(key).add(hop);
			});
			return m;
		};
		var A = load(v.a, 'a'), B = load(v.b, 'b'), rows = [], cls = [], cnt = { add: 0, del: 0, chg: 0, same: 0 };
		var keys = Array.from(new Set(Array.from(A.keys()).concat(Array.from(B.keys())))).sort();
		var srt = function (s) { return Array.from(s).sort().join(' | '); };
		keys.forEach(function (k) {
			var a = A.get(k), b = B.get(k), p = k.split('|');
			if (a && !b) { cnt.del++; rows.push([p[0], p[1], c.t('del'), srt(a), '']); cls.push('err'); }
			else if (!a && b) { cnt.add++; rows.push([p[0], p[1], c.t('add'), '', srt(b)]); cls.push('ok'); }
			else if (srt(a) !== srt(b)) { cnt.chg++; rows.push([p[0], p[1], (a.size > 1 || b.size > 1) ? c.t('chgEcmp') : c.t('chg'), srt(a), srt(b)]); cls.push('warn'); }
			else { cnt.same++; }
		});
		var cols = [c.t('c_vrf'), c.t('c_pfx'), c.t('c_st'), c.t('c_a'), c.t('c_b')];
		return { big: c.t('sum', cnt), tables: rows.length ? [{ h: c.t('tblH'), cols: cols, rows: rows, cls: cls }] : [], msgs: rows.length ? [] : [['ok', c.t('noDiff')]],
			x: rows.length ? { csv: { name: 'route-diff', cols: cols, rows: rows } } : {}, v: cnt };
	}
});
