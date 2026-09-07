package detector

import (
	"os"
	"path/filepath"
	"sync"

	"github.com/tonymora/celia/internal/domain/trouble"
	"gopkg.in/yaml.v3"
)

type CustomDetector struct {
	BaseDetector
	rulesDir string
	rules    []Rule
	mu       sync.RWMutex
}

func NewCustomDetector(rulesDir string) *CustomDetector {
	d := &CustomDetector{
		BaseDetector: BaseDetector{
			name:    "custom",
			enabled: true,
		},
		rulesDir: rulesDir,
		rules:    make([]Rule, 0),
	}

	if rulesDir != "" {
		d.LoadRules()
	}

	return d
}

func (d *CustomDetector) LoadRules() error {
	d.mu.Lock()
	defer d.mu.Unlock()

	d.rules = make([]Rule, 0)

	if d.rulesDir == "" {
		return nil
	}

	if _, err := os.Stat(d.rulesDir); os.IsNotExist(err) {
		return nil
	}

	entries, err := os.ReadDir(d.rulesDir)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		ext := filepath.Ext(entry.Name())
		if ext != ".yaml" && ext != ".yml" {
			continue
		}

		filePath := filepath.Join(d.rulesDir, entry.Name())
		rules, err := d.loadRuleFile(filePath)
		if err != nil {
			continue
		}

		d.rules = append(d.rules, rules...)
	}

	return nil
}

func (d *CustomDetector) loadRuleFile(path string) ([]Rule, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var ruleSet RuleSet
	if err := yaml.Unmarshal(data, &ruleSet); err != nil {
		var singleRule Rule
		if err := yaml.Unmarshal(data, &singleRule); err != nil {
			var ruleList []Rule
			if err := yaml.Unmarshal(data, &ruleList); err != nil {
				return nil, err
			}
			return ruleList, nil
		}
		return []Rule{singleRule}, nil
	}

	return ruleSet.Rules, nil
}

func (d *CustomDetector) Detect(input DetectorInput) []trouble.Problem {
	d.mu.RLock()
	defer d.mu.RUnlock()

	var problems []trouble.Problem

	for _, rule := range d.rules {
		if !rule.Enabled {
			continue
		}

		ruleProblems := rule.Evaluate(input)
		problems = append(problems, ruleProblems...)
	}

	return problems
}

func (d *CustomDetector) Rules() []Rule {
	d.mu.RLock()
	defer d.mu.RUnlock()

	result := make([]Rule, len(d.rules))
	copy(result, d.rules)
	return result
}

func (d *CustomDetector) AddRule(rule Rule) {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.rules = append(d.rules, rule)
}

func (d *CustomDetector) RemoveRule(name string) bool {
	d.mu.Lock()
	defer d.mu.Unlock()

	for i, rule := range d.rules {
		if rule.Name == name {
			d.rules = append(d.rules[:i], d.rules[i+1:]...)
			return true
		}
	}
	return false
}

func (d *CustomDetector) RuleCount() int {
	d.mu.RLock()
	defer d.mu.RUnlock()
	return len(d.rules)
}

func (d *CustomDetector) ReloadRules() error {
	return d.LoadRules()
}
